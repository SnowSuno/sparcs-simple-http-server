const http = require("http");
const fs = require("fs");
const SessionStorage = require("./session");

const port = 3000; // 변경 가능

const session = new SessionStorage();

const parseCookie = (cookie) => {
    // String 형태의 cookie를 object로 파싱
    try {
        return Object.fromEntries(cookie
            .split(";")
            .map(cookie => cookie.trim().split("=")),
        );
    } catch {
        return {};
    }
};

http
    .createServer((req, res) => {
        // HTTP 코드가 1.1이 아닌 경우 요청 거절
        if (req.httpVersion !== "1.1") {
            res.writeHead(505, { "Content-Type": "text/plain" });
            return res.end("HTTP/1.1 505 HTTP Version Not Supported");
        }
        
        const cookie = parseCookie(req.headers.cookie);
        
        // URL에 따라 라우팅
        switch (req.url) {
            case "/":
                // GET method만 허용
                if (req.method !== "GET") {
                    res.writeHead(405, { "Content-Type": "text/plain" });
                    return res.end("Method Not Allowed");
                }
                
                // 로그인되어 있지 않은 경우 /login 으로 리디렉션
                if (!session.isLoggedIn(cookie.sessionId)) {
                    res.writeHead(302, {
                        Location: "/login",
                    });
                    return res.end();
                }
                
                // index.html 반환
                return res.end(fs.readFileSync("./public/index.html"));
            
            case "/login":
                switch (req.method) {
                    case "GET":
                        // 이미 로그인된 경우 home으로 리디렉션
                        if (session.isLoggedIn(cookie.sessionId)) {
                            res.writeHead(302, {
                                Location: "/",
                            });
                            return res.end();
                        }
                        
                        // login.html 반환
                        return res.end(fs.readFileSync("./public/login.html"));
                    case "POST":
                        // 로그인 요청 핸들링
                        res.writeHead(302, {
                            "Set-Cookie": `sessionId=${session.login()}`,
                            "location": "/",
                        });
                        return res.end();
                    default:
                        // GET, POST method만 허용
                        res.writeHead(405, { "Content-Type": "text/plain" });
                        return res.end("Method Not Allowed");
                }
            case "/logout":
                if (req.method !== "POST") {
                    res.writeHead(404, { "Content-Type": "text/html" });
                    return res.end(fs.readFileSync("./public/404.html"));
                }
                
                session.logout(cookie.sessionId);
                res.writeHead(302, {
                    "location": "/login",
                });
                return res.end();
            
            default:
                res.writeHead(404, { "Content-Type": "text/html" });
                return res.end(fs.readFileSync("./public/not-found.html"));
        }
    })
    .listen(port, () => {
        console.log("Server listening on " + port);
    });
