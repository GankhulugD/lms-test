import { IUser } from '@lumieducation/h5p-server';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';

/**
 * @lumieducation/h5p-server нь өөрийн IUser interface-тэй ажилладаг тул JWT-ээс
 * гарган авсан CurrentUserPayload-ыг үүнд хөрвүүлж өгнө.
 */
export class H5pUser implements IUser {
  id: string;
  name: string;
  email: string;
  type = 'local';

  constructor(payload?: CurrentUserPayload) {
    // H5pAjaxController-ийн route-уудыг H5P core-ийн клиент JS (iframe дотор
    // ажилладаг jQuery $.ajax, <script src>, <link>) шууд дуудна — тэдгээр нь
    // бидний axios interceptor-оор нэмдэг Authorization header-ийг мэддэггүй
    // тул payload undefined байж болно. Ийм тохиолдолд crash хийхийн оронд
    // нэрлэгдээгүй ("anonymous") хэрэглэгч гэж үзнэ.
    this.id = payload?.userId ?? 'anonymous';
    this.email = payload?.email ?? 'anonymous@local';
    this.name = payload?.email ?? 'Зочин';
  }
}
