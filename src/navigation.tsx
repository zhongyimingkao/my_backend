import {
  createLocalizedPathnamesNavigation,
  Pathnames,
} from 'next-intl/navigation';

export const defaultLocale = 'zh';

export const locales = ['en', 'zh'] as const;

export const localePrefix =
  process.env.NEXT_PUBLIC_LOCALE_PREFIX === 'never' ? 'never' : 'as-needed';

export const pathnames = {
  '/': '/',
  '/user': '/user',
  '/storeManage': '/storeManage',
  '/storeManage/warehouse': '/storeManage/warehouse',
  '/storeManage/in': '/storeManage/in',
  '/inventoryManage':'/inventoryManage',
  '/storeManage/out': '/storeManage/out',
  '/userManage': '/userManage',
  '/userManage/wxUserManage': '/wxUserManage',
  '/userManage/webUserManage': '/webUserManage',
  '/userManage/role': '/role',
  '/departmentManage': '/departmentManage',
  '/reportExport': '/reportExport',
  '/cameraManage': '/cameraManage',
  '/surveillance': '/surveillance',
  '/surveillance/live': '/surveillance/live',
  '/surveillance/playback': '/surveillance/playback',
  '/door': '/door',
  // '/client': '/client',
  // '/client/redirect': '/client/redirect',
  // '/nested': {
  //   en: '/nested',
  //   zh: '/verschachtelt'
  // },
  // '/news/[articleId]': {
  //   en: '/news/[articleId]',
  //   zh: '/neuigkeiten/[articleId]'
  // }
} satisfies Pathnames<typeof locales>;

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({
    locales,
    localePrefix,
    pathnames,
  });
