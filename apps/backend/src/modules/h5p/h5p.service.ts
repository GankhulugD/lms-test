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
  contentUserDataManager!: H5P.ContentUserDataManager;

  async onModuleInit() {
    const h5pRoot = path.join(process.cwd(), 'h5p');

    const config = await new H5P.H5PConfig(
      await H5P.fsImplementations.JsonStorage.create(path.join(h5pRoot, 'config.json')),
    ).load();

    // main.ts-ийн app.setGlobalPrefix('api/v1')-тэй нийцүүлнэ: H5P клиентийн JS
    // код нь config.baseUrl-ийг ашиглаж бүх дараагийн (ajax/core/libraries/...)
    // URL-ийг угсардаг тул энэ утга бидний бодит route-той таарах ёстой.
    //
    // АНХААР: Local dev-д frontend/backend Vite proxy-гоор НЭГ л origin шиг
    // ажилладаг тул харьцангуй зам ('/api/v1/h5p') хангалттай байсан. Гэвч
    // production-д frontend (Cloudflare Workers) болон backend (Render) ӨӨР
    // domain дээр байрладаг тул харьцангуй зам frontend-ийн өөрийнх нь
    // domain-аас H5P script/style/ajax файлуудыг хайж, олдохгүй байх
    // асуудал үүсгэдэг. RENDER_EXTERNAL_URL (Render-ийн автоматаар өгдөг
    // backend-ийн бодит public URL) байгаа бол бүтэн URL ашиглана, эсрэг
    // тохиолдолд (local dev) харьцангуй зам хэвээр үлдэнэ.
    const publicUrl = process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_BACKEND_URL;
    config.baseUrl = publicUrl ? `${publicUrl}/api/v1/h5p` : '/api/v1/h5p';

    // LMS-ийн энгийн placeholder орчуулга — зөвхөн алдааны key-г л буцаадаг,
    // харин функциональ байдалд нөлөөлөхгүй. Хэрэглэгчид ойлгомжтой
    // мессеж хэрэгтэй бол дараа нь i18next + h5p-server-ийн assets/translations
    // руу шилжинэ.
    const translationCallback: H5P.ITranslationFunction = (key) => key;

    // Сурагчийн явцын төлөв (жиш нь: видеоны түр зогсоосон байрлал, эсвэл
    // "continue where you left off") хадгалах сан. Үүнийг оруулаагүй бол
    // H5P клиент JS нь GET /h5p/contentUserData/... руу дуудлага хийхэд
    // манай сервер route-гүй тул 404 буцааж, энэ нь Interactive Video зэрэг
    // content type-уудыг эхлэлээс нь бүрэн эвдэж, "Loading, please wait..."
    // дээр мөнхөд зогсооход хүргэдэг.
    const contentUserDataStorage = new H5P.fsImplementations.FileContentUserDataStorage(
      path.join(h5pRoot, 'content-user-data'),
    );

    this.h5pEditor = H5P.fs(
      config,
      path.join(h5pRoot, 'libraries'),
      path.join(h5pRoot, 'temporary-storage'),
      path.join(h5pRoot, 'content'),
      contentUserDataStorage,
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
      undefined,
      contentUserDataStorage,
    );
    this.h5pPlayer.setRenderer((model) => model);

    this.ajaxEndpoint = new H5P.H5PAjaxEndpoint(this.h5pEditor);
    // H5PPlayer-ийн адил property нь private тул H5PEditor-ийнхийг ашиглана
    // (хоёулаа ижил contentUserDataStorage-ийг хуваалцдаг тул зан төлөв ижил).
    this.contentUserDataManager = this.h5pEditor.contentUserDataManager;

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
