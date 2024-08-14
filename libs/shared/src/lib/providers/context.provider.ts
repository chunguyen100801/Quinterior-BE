import { ClsServiceManager } from 'nestjs-cls';
import { ENUM_LANGUAGE } from '../@types';
import { UserWithTokenKeyId } from '../interfaces';

export class ContextProvider {
  private static readonly nameSpace = 'request';

  private static readonly authUserKey = 'user_key';

  private static readonly languageKey = 'language_key';

  private static get<T>(key: string) {
    const store = ClsServiceManager.getClsService();

    return store.get<T>(ContextProvider.getKeyWithNamespace(key));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static set(key: string, value: any): void {
    const store = ClsServiceManager.getClsService();

    store.set(ContextProvider.getKeyWithNamespace(key), value);
  }

  private static getKeyWithNamespace(key: string): string {
    return `${ContextProvider.nameSpace}.${key}`;
  }

  static setAuthUser(user: UserWithTokenKeyId): void {
    ContextProvider.set(ContextProvider.authUserKey, user);
  }

  static setLanguage(language: string): void {
    ContextProvider.set(ContextProvider.languageKey, language);
  }

  static getLanguage(): ENUM_LANGUAGE | undefined {
    return ContextProvider.get<ENUM_LANGUAGE>(ContextProvider.languageKey);
  }

  static getAuthUser(): UserWithTokenKeyId | undefined {
    return ContextProvider.get<UserWithTokenKeyId>(ContextProvider.authUserKey);
  }
}
