import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseInterceptors,
  UploadedFiles,
  Body,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { Readable } from 'stream';
import { H5pService } from './h5p.service';
import { H5pUser } from './h5p-user';

/**
 * @lumieducation/h5p-server-ийн H5P client JS-ээс шууд дуудагдах "протоколын"
 * маршрутууд (ajax, content, libraries, temp-files, params, download). Эдгээрийг
 * @lumieducation/h5p-express ашиглаж болох байсан ч тэр нь зөвхөн Express-д
 * зориулагдсан тул H5PAjaxEndpoint-ийн методуудыг энд шууд дуудна.
 *
 * АНХААР — ЯГ ЭНД JwtAuthGuard АШИГЛАХГҮЙ (санаатай шийдвэр): Эдгээр route-ыг
 * манай React/axios код ХЭЗЭЭ Ч дуудахгүй — зөвхөн H5P core-ийн клиент JS
 * (editor iframe доторх jQuery $.ajax, <script src>, <link>, зураг г.м) шууд
 * дуудна. Тэр JS бидний JWT-ийг мэддэггүй тул Authorization header нэмэх
 * боломжгүй — иймд guard тавьвал H5P core-ийн бүх хүсэлт 401-д цохиулж,
 * "Error, unable to load libraries." мэт алдаа гарна.
 *
 * АЮУЛГҮЙ БАЙДЛЫН ХЯЗГААРЛАЛ: H5P-ийн стандарт зөвшөөрлийн систем
 * (LaissezFairePermissionSystem) энд бүгдийг зөвшөөрдөг тул нэвтрэлт байсан
 * ч байгаагүй ч ялгаагүй — contentId мэддэг хэн ч эдгээр route-оор файлд
 * хандах боломжтой байсан (учир нь бүртгэл нээлттэй, хэн ч эрх авах боломжтой).
 * Бодит хамгаалалт (ownership/enrollment) бүгд H5pContentController дээр
 * хийгддэг тул MVP-д хангалттай, гэхдээ ирээдүйд custom IPermissionSystem
 * бичиж энэ давхаргыг чангалах хэрэгтэй.
 */
@ApiExcludeController()
@Controller('h5p')
export class H5pAjaxController {
  constructor(private readonly h5p: H5pService) {}

  @Get('ajax')
  async getAjax(@Query() query: Record<string, string>, @Req() req: Request) {
    const user = new H5pUser(req.user as any);
    return this.h5p.ajaxEndpoint.getAjax(
      query.action,
      query.machineName,
      query.majorVersion,
      query.minorVersion,
      query.language,
      user,
    );
  }

  @Post('ajax')
  @UseInterceptors(AnyFilesInterceptor())
  async postAjax(
    @Query() query: Record<string, string>,
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: Request,
  ) {
    const user = new H5pUser(req.user as any);
    const toH5pFile = (f?: Express.Multer.File) =>
      f && {
        data: f.buffer,
        mimetype: f.mimetype,
        name: f.originalname,
        size: f.size,
      };

    const fileEntry = files?.find((f) => f.fieldname === 'file');
    const h5pEntry = files?.find((f) => f.fieldname === 'h5p');

    return this.h5p.ajaxEndpoint.postAjax(
      query.action,
      body,
      query.language,
      user,
      toH5pFile(fileEntry),
      query.id,
      (key: string) => key,
      toH5pFile(h5pEntry),
      query.hubId,
    );
  }

  @Get('content/:contentId/*filename')
  async getContentFile(@Req() req: Request, @Res() res: Response) {
    const contentId = req.params.contentId as string;
    const filename = this.joinWildcard(req.params.filename);
    const user = new H5pUser(req.user as any);

    const { mimetype, stream, stats } = await this.h5p.ajaxEndpoint.getContentFile(
      contentId,
      filename,
      user,
    );
    this.pipe(res, mimetype, stream, stats.size);
  }

  @Get('libraries/:uberName/*filename')
  async getLibraryFile(@Req() req: Request, @Res() res: Response) {
    const uberName = req.params.uberName as string;
    const filename = this.joinWildcard(req.params.filename);

    const { mimetype, stream, stats } = await this.h5p.ajaxEndpoint.getLibraryFile(
      uberName,
      filename,
    );
    this.pipe(res, mimetype, stream, stats.size, { 'Cache-Control': 'public, max-age=31536000' });
  }

  @Get('temp-files/*filename')
  async getTemporaryFile(@Req() req: Request, @Res() res: Response) {
    const filename = this.joinWildcard(req.params.filename);
    const user = new H5pUser(req.user as any);

    const { mimetype, stream, stats } = await this.h5p.ajaxEndpoint.getTemporaryFile(
      filename,
      user,
    );
    this.pipe(res, mimetype, stream, stats.size);
  }

  @Get('params/:contentId')
  async getContentParameters(@Req() req: Request) {
    const user = new H5pUser(req.user as any);
    return this.h5p.ajaxEndpoint.getContentParameters(req.params.contentId as string, user);
  }

  @Get('download/:contentId')
  async getDownload(@Req() req: Request, @Res() res: Response) {
    const user = new H5pUser(req.user as any);
    const contentId = req.params.contentId as string;
    res.setHeader('Content-disposition', `attachment; filename=${contentId}.h5p`);
    await this.h5p.ajaxEndpoint.getDownload(contentId, user, res);
  }

  private joinWildcard(param: string | string[] | undefined): string {
    return Array.isArray(param) ? param.join('/') : (param ?? '');
  }

  private pipe(
    res: Response,
    mimetype: string,
    stream: Readable,
    size: number,
    extraHeaders?: Record<string, string>,
  ) {
    res.writeHead(200, {
      ...(extraHeaders ?? {}),
      'Content-Type': mimetype,
      'Content-Length': size,
      'Accept-Ranges': 'bytes',
    });
    stream.on('error', () => res.status(404).end());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  }
}
