/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as PreciosRouteImport } from './routes/precios'
import { Route as PerfilRouteImport } from './routes/perfil'
import { Route as MisComunidadesRouteImport } from './routes/mis-comunidades'
import { Route as MembresiaRouteImport } from './routes/membresia'
import { Route as ContactoRouteImport } from './routes/contacto'
import { Route as ComoFuncionaRouteImport } from './routes/como-funciona'
import { Route as SignupRouteRouteImport } from './routes/signup/route'
import { Route as ReservaRouteRouteImport } from './routes/reserva/route'
import { Route as PinRouteRouteImport } from './routes/pin/route'
import { Route as LoginRouteRouteImport } from './routes/login/route'
import { Route as HomeRouteRouteImport } from './routes/home/route'
import { Route as ForgotRouteRouteImport } from './routes/forgot/route'
import { Route as ChangepasswordRouteRouteImport } from './routes/changepassword/route'
import { Route as IndexRouteImport } from './routes/index'
import { Route as ReservasIndexRouteImport } from './routes/reservas/index'
import { Route as ReservaIndexRouteImport } from './routes/reserva/index'
import { Route as MisComunidadesIndexRouteImport } from './routes/mis-comunidades/index'
import { Route as ReservaServiciosRouteImport } from './routes/reserva/servicios'
import { Route as ReservaLugarRouteImport } from './routes/reserva/lugar'
import { Route as ReservaHorarioRouteImport } from './routes/reserva/horario'
import { Route as ReservaConfirmacionRouteImport } from './routes/reserva/confirmacion'
import { Route as OnboardingMembresiaRouteImport } from './routes/onboarding/membresia'
import { Route as MisComunidadesCommunityIdReservasHistorialRouteImport } from './routes/mis-comunidades/$communityId/reservas/historial'

const PreciosRoute = PreciosRouteImport.update({
  id: '/precios',
  path: '/precios',
  getParentRoute: () => rootRouteImport,
} as any)
const PerfilRoute = PerfilRouteImport.update({
  id: '/perfil',
  path: '/perfil',
  getParentRoute: () => rootRouteImport,
} as any)
const MisComunidadesRoute = MisComunidadesRouteImport.update({
  id: '/mis-comunidades',
  path: '/mis-comunidades',
  getParentRoute: () => rootRouteImport,
} as any)
const MembresiaRoute = MembresiaRouteImport.update({
  id: '/membresia',
  path: '/membresia',
  getParentRoute: () => rootRouteImport,
} as any)
const ContactoRoute = ContactoRouteImport.update({
  id: '/contacto',
  path: '/contacto',
  getParentRoute: () => rootRouteImport,
} as any)
const ComoFuncionaRoute = ComoFuncionaRouteImport.update({
  id: '/como-funciona',
  path: '/como-funciona',
  getParentRoute: () => rootRouteImport,
} as any)
const SignupRouteRoute = SignupRouteRouteImport.update({
  id: '/signup',
  path: '/signup',
  getParentRoute: () => rootRouteImport,
} as any)
const ReservaRouteRoute = ReservaRouteRouteImport.update({
  id: '/reserva',
  path: '/reserva',
  getParentRoute: () => rootRouteImport,
} as any)
const PinRouteRoute = PinRouteRouteImport.update({
  id: '/pin',
  path: '/pin',
  getParentRoute: () => rootRouteImport,
} as any)
const LoginRouteRoute = LoginRouteRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRouteImport,
} as any)
const HomeRouteRoute = HomeRouteRouteImport.update({
  id: '/home',
  path: '/home',
  getParentRoute: () => rootRouteImport,
} as any)
const ForgotRouteRoute = ForgotRouteRouteImport.update({
  id: '/forgot',
  path: '/forgot',
  getParentRoute: () => rootRouteImport,
} as any)
const ChangepasswordRouteRoute = ChangepasswordRouteRouteImport.update({
  id: '/changepassword',
  path: '/changepassword',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const ReservasIndexRoute = ReservasIndexRouteImport.update({
  id: '/reservas/',
  path: '/reservas/',
  getParentRoute: () => rootRouteImport,
} as any)
const ReservaIndexRoute = ReservaIndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => ReservaRouteRoute,
} as any)
const MisComunidadesIndexRoute = MisComunidadesIndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => MisComunidadesRoute,
} as any)
const ReservaServiciosRoute = ReservaServiciosRouteImport.update({
  id: '/servicios',
  path: '/servicios',
  getParentRoute: () => ReservaRouteRoute,
} as any)
const ReservaLugarRoute = ReservaLugarRouteImport.update({
  id: '/lugar',
  path: '/lugar',
  getParentRoute: () => ReservaRouteRoute,
} as any)
const ReservaHorarioRoute = ReservaHorarioRouteImport.update({
  id: '/horario',
  path: '/horario',
  getParentRoute: () => ReservaRouteRoute,
} as any)
const ReservaConfirmacionRoute = ReservaConfirmacionRouteImport.update({
  id: '/confirmacion',
  path: '/confirmacion',
  getParentRoute: () => ReservaRouteRoute,
} as any)
const OnboardingMembresiaRoute = OnboardingMembresiaRouteImport.update({
  id: '/onboarding/membresia',
  path: '/onboarding/membresia',
  getParentRoute: () => rootRouteImport,
} as any)
const MisComunidadesCommunityIdReservasHistorialRoute =
  MisComunidadesCommunityIdReservasHistorialRouteImport.update({
    id: '/$communityId/reservas/historial',
    path: '/$communityId/reservas/historial',
    getParentRoute: () => MisComunidadesRoute,
  } as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/changepassword': typeof ChangepasswordRouteRoute
  '/forgot': typeof ForgotRouteRoute
  '/home': typeof HomeRouteRoute
  '/login': typeof LoginRouteRoute
  '/pin': typeof PinRouteRoute
  '/reserva': typeof ReservaRouteRouteWithChildren
  '/signup': typeof SignupRouteRoute
  '/como-funciona': typeof ComoFuncionaRoute
  '/contacto': typeof ContactoRoute
  '/membresia': typeof MembresiaRoute
  '/mis-comunidades': typeof MisComunidadesRouteWithChildren
  '/perfil': typeof PerfilRoute
  '/precios': typeof PreciosRoute
  '/onboarding/membresia': typeof OnboardingMembresiaRoute
  '/reserva/confirmacion': typeof ReservaConfirmacionRoute
  '/reserva/horario': typeof ReservaHorarioRoute
  '/reserva/lugar': typeof ReservaLugarRoute
  '/reserva/servicios': typeof ReservaServiciosRoute
  '/mis-comunidades/': typeof MisComunidadesIndexRoute
  '/reserva/': typeof ReservaIndexRoute
  '/reservas': typeof ReservasIndexRoute
  '/mis-comunidades/$communityId/reservas/historial': typeof MisComunidadesCommunityIdReservasHistorialRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/changepassword': typeof ChangepasswordRouteRoute
  '/forgot': typeof ForgotRouteRoute
  '/home': typeof HomeRouteRoute
  '/login': typeof LoginRouteRoute
  '/pin': typeof PinRouteRoute
  '/signup': typeof SignupRouteRoute
  '/como-funciona': typeof ComoFuncionaRoute
  '/contacto': typeof ContactoRoute
  '/membresia': typeof MembresiaRoute
  '/perfil': typeof PerfilRoute
  '/precios': typeof PreciosRoute
  '/onboarding/membresia': typeof OnboardingMembresiaRoute
  '/reserva/confirmacion': typeof ReservaConfirmacionRoute
  '/reserva/horario': typeof ReservaHorarioRoute
  '/reserva/lugar': typeof ReservaLugarRoute
  '/reserva/servicios': typeof ReservaServiciosRoute
  '/mis-comunidades': typeof MisComunidadesIndexRoute
  '/reserva': typeof ReservaIndexRoute
  '/reservas': typeof ReservasIndexRoute
  '/mis-comunidades/$communityId/reservas/historial': typeof MisComunidadesCommunityIdReservasHistorialRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/changepassword': typeof ChangepasswordRouteRoute
  '/forgot': typeof ForgotRouteRoute
  '/home': typeof HomeRouteRoute
  '/login': typeof LoginRouteRoute
  '/pin': typeof PinRouteRoute
  '/reserva': typeof ReservaRouteRouteWithChildren
  '/signup': typeof SignupRouteRoute
  '/como-funciona': typeof ComoFuncionaRoute
  '/contacto': typeof ContactoRoute
  '/membresia': typeof MembresiaRoute
  '/mis-comunidades': typeof MisComunidadesRouteWithChildren
  '/perfil': typeof PerfilRoute
  '/precios': typeof PreciosRoute
  '/onboarding/membresia': typeof OnboardingMembresiaRoute
  '/reserva/confirmacion': typeof ReservaConfirmacionRoute
  '/reserva/horario': typeof ReservaHorarioRoute
  '/reserva/lugar': typeof ReservaLugarRoute
  '/reserva/servicios': typeof ReservaServiciosRoute
  '/mis-comunidades/': typeof MisComunidadesIndexRoute
  '/reserva/': typeof ReservaIndexRoute
  '/reservas/': typeof ReservasIndexRoute
  '/mis-comunidades/$communityId/reservas/historial': typeof MisComunidadesCommunityIdReservasHistorialRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/changepassword'
    | '/forgot'
    | '/home'
    | '/login'
    | '/pin'
    | '/reserva'
    | '/signup'
    | '/como-funciona'
    | '/contacto'
    | '/membresia'
    | '/mis-comunidades'
    | '/perfil'
    | '/precios'
    | '/onboarding/membresia'
    | '/reserva/confirmacion'
    | '/reserva/horario'
    | '/reserva/lugar'
    | '/reserva/servicios'
    | '/mis-comunidades/'
    | '/reserva/'
    | '/reservas'
    | '/mis-comunidades/$communityId/reservas/historial'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/changepassword'
    | '/forgot'
    | '/home'
    | '/login'
    | '/pin'
    | '/signup'
    | '/como-funciona'
    | '/contacto'
    | '/membresia'
    | '/perfil'
    | '/precios'
    | '/onboarding/membresia'
    | '/reserva/confirmacion'
    | '/reserva/horario'
    | '/reserva/lugar'
    | '/reserva/servicios'
    | '/mis-comunidades'
    | '/reserva'
    | '/reservas'
    | '/mis-comunidades/$communityId/reservas/historial'
  id:
    | '__root__'
    | '/'
    | '/changepassword'
    | '/forgot'
    | '/home'
    | '/login'
    | '/pin'
    | '/reserva'
    | '/signup'
    | '/como-funciona'
    | '/contacto'
    | '/membresia'
    | '/mis-comunidades'
    | '/perfil'
    | '/precios'
    | '/onboarding/membresia'
    | '/reserva/confirmacion'
    | '/reserva/horario'
    | '/reserva/lugar'
    | '/reserva/servicios'
    | '/mis-comunidades/'
    | '/reserva/'
    | '/reservas/'
    | '/mis-comunidades/$communityId/reservas/historial'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  ChangepasswordRouteRoute: typeof ChangepasswordRouteRoute
  ForgotRouteRoute: typeof ForgotRouteRoute
  HomeRouteRoute: typeof HomeRouteRoute
  LoginRouteRoute: typeof LoginRouteRoute
  PinRouteRoute: typeof PinRouteRoute
  ReservaRouteRoute: typeof ReservaRouteRouteWithChildren
  SignupRouteRoute: typeof SignupRouteRoute
  ComoFuncionaRoute: typeof ComoFuncionaRoute
  ContactoRoute: typeof ContactoRoute
  MembresiaRoute: typeof MembresiaRoute
  MisComunidadesRoute: typeof MisComunidadesRouteWithChildren
  PerfilRoute: typeof PerfilRoute
  PreciosRoute: typeof PreciosRoute
  OnboardingMembresiaRoute: typeof OnboardingMembresiaRoute
  ReservasIndexRoute: typeof ReservasIndexRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/precios': {
      id: '/precios'
      path: '/precios'
      fullPath: '/precios'
      preLoaderRoute: typeof PreciosRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/perfil': {
      id: '/perfil'
      path: '/perfil'
      fullPath: '/perfil'
      preLoaderRoute: typeof PerfilRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/mis-comunidades': {
      id: '/mis-comunidades'
      path: '/mis-comunidades'
      fullPath: '/mis-comunidades'
      preLoaderRoute: typeof MisComunidadesRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/membresia': {
      id: '/membresia'
      path: '/membresia'
      fullPath: '/membresia'
      preLoaderRoute: typeof MembresiaRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/contacto': {
      id: '/contacto'
      path: '/contacto'
      fullPath: '/contacto'
      preLoaderRoute: typeof ContactoRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/como-funciona': {
      id: '/como-funciona'
      path: '/como-funciona'
      fullPath: '/como-funciona'
      preLoaderRoute: typeof ComoFuncionaRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/signup': {
      id: '/signup'
      path: '/signup'
      fullPath: '/signup'
      preLoaderRoute: typeof SignupRouteRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/reserva': {
      id: '/reserva'
      path: '/reserva'
      fullPath: '/reserva'
      preLoaderRoute: typeof ReservaRouteRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/pin': {
      id: '/pin'
      path: '/pin'
      fullPath: '/pin'
      preLoaderRoute: typeof PinRouteRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginRouteRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/home': {
      id: '/home'
      path: '/home'
      fullPath: '/home'
      preLoaderRoute: typeof HomeRouteRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/forgot': {
      id: '/forgot'
      path: '/forgot'
      fullPath: '/forgot'
      preLoaderRoute: typeof ForgotRouteRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/changepassword': {
      id: '/changepassword'
      path: '/changepassword'
      fullPath: '/changepassword'
      preLoaderRoute: typeof ChangepasswordRouteRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/reservas/': {
      id: '/reservas/'
      path: '/reservas'
      fullPath: '/reservas'
      preLoaderRoute: typeof ReservasIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/reserva/': {
      id: '/reserva/'
      path: '/'
      fullPath: '/reserva/'
      preLoaderRoute: typeof ReservaIndexRouteImport
      parentRoute: typeof ReservaRouteRoute
    }
    '/mis-comunidades/': {
      id: '/mis-comunidades/'
      path: '/'
      fullPath: '/mis-comunidades/'
      preLoaderRoute: typeof MisComunidadesIndexRouteImport
      parentRoute: typeof MisComunidadesRoute
    }
    '/reserva/servicios': {
      id: '/reserva/servicios'
      path: '/servicios'
      fullPath: '/reserva/servicios'
      preLoaderRoute: typeof ReservaServiciosRouteImport
      parentRoute: typeof ReservaRouteRoute
    }
    '/reserva/lugar': {
      id: '/reserva/lugar'
      path: '/lugar'
      fullPath: '/reserva/lugar'
      preLoaderRoute: typeof ReservaLugarRouteImport
      parentRoute: typeof ReservaRouteRoute
    }
    '/reserva/horario': {
      id: '/reserva/horario'
      path: '/horario'
      fullPath: '/reserva/horario'
      preLoaderRoute: typeof ReservaHorarioRouteImport
      parentRoute: typeof ReservaRouteRoute
    }
    '/reserva/confirmacion': {
      id: '/reserva/confirmacion'
      path: '/confirmacion'
      fullPath: '/reserva/confirmacion'
      preLoaderRoute: typeof ReservaConfirmacionRouteImport
      parentRoute: typeof ReservaRouteRoute
    }
    '/onboarding/membresia': {
      id: '/onboarding/membresia'
      path: '/onboarding/membresia'
      fullPath: '/onboarding/membresia'
      preLoaderRoute: typeof OnboardingMembresiaRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/mis-comunidades/$communityId/reservas/historial': {
      id: '/mis-comunidades/$communityId/reservas/historial'
      path: '/$communityId/reservas/historial'
      fullPath: '/mis-comunidades/$communityId/reservas/historial'
      preLoaderRoute: typeof MisComunidadesCommunityIdReservasHistorialRouteImport
      parentRoute: typeof MisComunidadesRoute
    }
  }
}

interface ReservaRouteRouteChildren {
  ReservaConfirmacionRoute: typeof ReservaConfirmacionRoute
  ReservaHorarioRoute: typeof ReservaHorarioRoute
  ReservaLugarRoute: typeof ReservaLugarRoute
  ReservaServiciosRoute: typeof ReservaServiciosRoute
  ReservaIndexRoute: typeof ReservaIndexRoute
}

const ReservaRouteRouteChildren: ReservaRouteRouteChildren = {
  ReservaConfirmacionRoute: ReservaConfirmacionRoute,
  ReservaHorarioRoute: ReservaHorarioRoute,
  ReservaLugarRoute: ReservaLugarRoute,
  ReservaServiciosRoute: ReservaServiciosRoute,
  ReservaIndexRoute: ReservaIndexRoute,
}

const ReservaRouteRouteWithChildren = ReservaRouteRoute._addFileChildren(
  ReservaRouteRouteChildren,
)

interface MisComunidadesRouteChildren {
  MisComunidadesIndexRoute: typeof MisComunidadesIndexRoute
  MisComunidadesCommunityIdReservasHistorialRoute: typeof MisComunidadesCommunityIdReservasHistorialRoute
}

const MisComunidadesRouteChildren: MisComunidadesRouteChildren = {
  MisComunidadesIndexRoute: MisComunidadesIndexRoute,
  MisComunidadesCommunityIdReservasHistorialRoute:
    MisComunidadesCommunityIdReservasHistorialRoute,
}

const MisComunidadesRouteWithChildren = MisComunidadesRoute._addFileChildren(
  MisComunidadesRouteChildren,
)

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  ChangepasswordRouteRoute: ChangepasswordRouteRoute,
  ForgotRouteRoute: ForgotRouteRoute,
  HomeRouteRoute: HomeRouteRoute,
  LoginRouteRoute: LoginRouteRoute,
  PinRouteRoute: PinRouteRoute,
  ReservaRouteRoute: ReservaRouteRouteWithChildren,
  SignupRouteRoute: SignupRouteRoute,
  ComoFuncionaRoute: ComoFuncionaRoute,
  ContactoRoute: ContactoRoute,
  MembresiaRoute: MembresiaRoute,
  MisComunidadesRoute: MisComunidadesRouteWithChildren,
  PerfilRoute: PerfilRoute,
  PreciosRoute: PreciosRoute,
  OnboardingMembresiaRoute: OnboardingMembresiaRoute,
  ReservasIndexRoute: ReservasIndexRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
