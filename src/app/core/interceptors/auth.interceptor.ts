import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	console.log('🚀 Interceptor ejecutado para:', req.url);
	console.log('📋 Request method:', req.method);
	
	// Excluir rutas de autenticación
	if (req.url.includes('/auth/login') || req.url.includes('/auth/token')) {
		console.log('⏭️ Ruta de auth excluida, sin token');
		return next(req);
	}

	const token = localStorage.getItem('auth_token');
	console.log('🔑 Token encontrado:', token ? 'SÍ (' + token.substring(0, 20) + '...)' : 'NO');
	
	if (!token) {
		console.warn('⚠️ No hay token en localStorage');
		return next(req);
	}

	console.log('🔐 Clonando request con Authorization header');
	const authReq = req.clone({
		setHeaders: {
			'Authorization': `Bearer ${token}`
		}
	});

	// Verificar que el header se añadió
	const authHeader = authReq.headers.get('Authorization');
	console.log('✅ Header Authorization:', authHeader ? authHeader.substring(0, 30) + '...' : 'NO AÑADIDO');
	console.log('📤 Enviando request a:', authReq.url);

	return next(authReq);
};
