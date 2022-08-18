/*
실제 서비스에서는 세션 관리를 위해 Redis 등을 사용하겠지만,
여기서는 구현의 편의를 위해 persist 되지 않는 map을 사용하였습니다.
 */
class SessionStorage {
    constructor() {
        this.session = new Map();
    }
    
    #generateSessionId() {
        const sessionId = Math.random().toString(36).substring(2);
        
        return this.session.has(sessionId)
            ? this.#generateSessionId()
            : sessionId;
    }
    
    login() {
        const sessionId = this.#generateSessionId();
        this.session.set(sessionId, true);
        return sessionId;
    }
    
    logout(sessionId) {
        this.session.delete(sessionId);
    }
    
    isLoggedIn(sessionId) {
        return !!sessionId && this.session.has(sessionId);
    }
}

module.exports = SessionStorage;
