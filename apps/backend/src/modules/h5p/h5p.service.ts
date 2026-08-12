import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as path from 'path';
import * as H5P from '@lumieducation/h5p-server';

@Injectable()
export class H5pService implements OnModuleInit {
  private readonly logger = new Logger(H5pService.name);

  h5pEditor!: H5P.H5PEditor;
  h5pPlayer!: H5P.H5PPlayer;
  ajaxEndpoint!: H5P.H5PAjaxEndpoint;

  async onModuleInit() {
    const h5pRoot = path.join(process.cwd(), 'h5p');

    const config = await new H5P.H5PConfig(
      await H5P.fsImplementations.JsonStorage.create(path.join(h5pRoot, 'config.json')),
    ).load();

    // main.ts-ийн app.setGlobalPrefix('api/v1')-тэй нийцүүлнэ: H5P клиентийн JS
    // код нь config.baseUrl-ийг ашиглаж бүх дараагийн (ajax/core/libraries/...)
    // URL-ийг угсардаг тул энэ утга бидний бодит route-той таарах ёстой.
    config.baseUrl = '/api/v1/h5p';

    // LMS-ийн энгийн placeholder орчуулга — зөвхөн алдааны key-г л буцаадаг,
    // харин функциональ байдалд нөлөөлөхгүй. Хэрэглэгчид ойлгомжтой
    // мессеж хэрэгтэй бол дараа нь i18next + h5p-server-ийн assets/translations
    // руу шилжинэ.
    const translationCallback: H5P.ITranslationFunction = (key) => key;

    this.h5pEditor = H5P.fs(
      config,
      path.join(h5pRoot, 'libraries'),
      path.join(h5pRoot, 'temporary-storage'),
      path.join(h5pRoot, 'content'),
      undefined,
      undefined,
      translationCallback,
    );

    // SPA учир HTML render биш, дата (JSON) шууд буцаадаг renderer болгоно.
    this.h5pEditor.setRenderer((model) => model);

    this.h5pPlayer = new H5P.H5PPlayer(
      this.h5pEditor.libraryStorage,
      this.h5pEditor.contentStorage,
      config,
      undefined,
      undefined,
      translationCallback,
    );
    this.h5pPlayer.setRenderer((model) => model);

    this.ajaxEndpoint = new H5P.H5PAjaxEndpoint(this.h5pEditor);

    this.logger.log('H5P editor/player бэлэн боллоо');
  }

  // Хугацаа хэтэрсэн temp file-ыг цэвэрлэнэ (save хийгдэхгүй орхигдсон upload-ууд)
  @Cron(CronExpression.EVERY_5_MINUTES)
  async cleanupTemporaryFiles() {
    await this.h5pEditor?.temporaryFileManager.cleanUp();
  }

  // H5P Hub-аас боломжтой контент төрлүүдийн мэдээллийг шинэчилнэ
  @Cron(CronExpression.EVERY_12_HOURS)
  async updateContentTypeCache() {
    await this.h5pEditor?.contentTypeCache.updateIfNecessary();
  }
}
