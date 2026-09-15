# DevGuide - Rebuild Guide

> Is guide ko tab update karna hai jab lagbhag 1 hour ho, ek meaningful feature/module complete ho, ya explicitly `update rebuild guide` bola jaye. Yeh daily changelog nahi hai.

## 1. Yeh project kya banata hai

DevGuide abhi ek **reusable application foundation** banata hai, complete end-user product nahi. Isme browser UI ke liye Next.js starter, API ke liye Spring Boot starter, aur local data ke liye PostgreSQL + pgvector ready hain.

Abhi user ko functional product flow nahi milta: koi API endpoint, domain model, login, ya database-backed screen implemented nahi hai. Browser par selected starter app ka placeholder page render hota hai.

**Assumption:** Spring AI aur pgvector se lagta hai ki future target AI/RAG-assisted developer guidance ho sakta hai. Yeh feature abhi verified implementation nahi hai.

Overall target flow yeh hoga:

`User -> selected Next.js frontend -> Spring Boot API -> PostgreSQL/pgvector`

## 2. Architecture at a glance

### Frontend

- **Technology:** Next.js 16.3.4, React 19, TypeScript. `client/ui` aur `client/next-app` mein Tailwind CSS + shadcn setup bhi hai.
- **Responsibility:** Pages, reusable UI components, user interaction aur future API calls.
- **Active app:** `client/next-app`. Iska `app/layout.tsx` theme aur React Query providers attach karta hai. `components/providers/query-providers.tsx` mein shared `QueryClient` setup hai.
- **Important caution:** `client/ui` bhi ek separate starter app hai. Product work mein duplicate feature implementation avoid karne ke liye `client/next-app` ko canonical frontend treat karo.

### Backend/API

- **Technology:** Java 26, Spring Boot 4.1.1, Spring Web MVC, JPA, Spring Security/OAuth2 Client, Spring AI OpenAI starter.
- **Responsibility:** Future REST APIs, business logic, database access, authentication aur AI integration.
- **Important location:** `backend/src/main/java/jatin/backend/BackendApplication.java` app start karta hai. `backend/pom.xml` dependencies define karta hai. `backend/src/main/resources/application.properties` datasource, safe error responses aur explicit Spring AI model selection define karta hai.
- **Current limitation:** Controller, service, entity aur repository abhi nahi bane hain.

### Database

- **Technology:** PostgreSQL 16 through `pgvector/pgvector:pg16` Docker image.
- **Responsibility:** App data persist karna; future vector similarity data ke liye `vector` extension ready rakhna.
- **Important location:** Root `docker-compose.yml` aur `docker/postgres/init-extensions.sql`.
- **Current configuration:** Database `devguide`; host port `127.0.0.1:5433`; container port `5432`; default user `devguide`; named volume `devguide_pg_data`. Password checked in nahi hai—`.env` se provide karna required hai.

## 2.1 Current update notes (11 September 2026)

- Both frontend apps are on Next.js `16.3.4`; production dependency audits report zero known vulnerabilities.
- Next.js layouts use nonce-based CSP plus `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` headers.
- Remote Google-font fetching was removed, so production builds work without an external font download.
- `client/next-app` has `@tanstack/react-query` installed and a root-level `QueryProvider`.
- Backend tests use in-memory H2 and pass without PostgreSQL, Ollama, or OpenAI credentials.
- Copy root `.env.example` to `.env`, replace its placeholders, and keep the real `.env` uncommitted.

## 3. Scratch se rebuild order

### Step 1: Initial setup

**Kya karna hai:** Machine par JDK 26, Docker Desktop, Node.js/npm aur Git install rakho. Backend aur frontend folders separately banao.

**Kaise karna hai:**

```powershell
mkdir backend, client, docker\postgres
```

Backend ko Spring Boot project ke roop mein create karo aur dependencies add karo: Web MVC, JPA, Security, OAuth2 Client, PostgreSQL driver aur Spring AI OpenAI starter. Maven Wrapper (`mvnw`, `mvnw.cmd`) project mein rakho.

Frontend ke liye **ek** Next.js app banao. Current project ka reusable baseline `client/next-app` hai, jahan shadcn components, theme provider aur React Query root provider already configured hain.

**Required environment variables:** Root `.env.example` ko `.env` ke roop mein copy karo. `POSTGRES_PASSWORD` aur matching `DATABASE_PASSWORD` ko strong random value do. OpenAI profile run karte waqt `OPENAI_API_KEY` bhi provide karo. Real `.env` source control mein kabhi commit mat karo.

**Expected result:** `backend/` mein Maven-based Spring Boot project aur selected `client/<app>/` mein runnable Next.js project hona chahiye.

### Step 2: Database / external services

**Kya karna hai:** Local PostgreSQL + pgvector service Compose se run karni hai.

**Kaise karna hai:** Root mein `docker-compose.yml` banao jisme:

- Image `pgvector/pgvector:pg16` ho.
- Database `devguide` aur host mapping `127.0.0.1:5433:5432` ho.
- Named volume `devguide_pg_data` data persistence ke liye ho.
- `docker/postgres/init-extensions.sql` ko Docker init directory mein read-only mount karo.
- Health check `pg_isready` ko Compose ke `POSTGRES_USER` aur `POSTGRES_DB` environment values ke saath run kare.

Init SQL mein yeh lines rakho:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS hstore;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Phir run karo:

```powershell
docker compose up -d
docker compose ps
```

**Expected result:** `postgres` service healthy dikhni chahiye aur local connection URL `jdbc:postgresql://localhost:5433/devguide` usable hona chahiye.

**Important:** Init SQL sirf fresh/empty Docker volume par execute hoti hai. Existing volume ke liye naya SQL change automatic apply nahi hoga.

### Step 3: Backend / core logic

**Kya karna hai:** Database connection se start karke ek chhota vertical API slice banao.

**Kaise karna hai:**

1. `application.properties` mein datasource URL default `jdbc:postgresql://localhost:5433/devguide` hai; deployment-specific URL `DATABASE_URL` se override karo.
2. DB username/password `DATABASE_USERNAME` aur `DATABASE_PASSWORD` se provide karo.
3. Ek domain package banao, for example `guide`.
4. Is order mein classes add karo: entity/model -> JPA repository -> service -> controller -> request/response DTO -> validation/error handling.
5. First API ko curl/Postman se verify karo, phir frontend connect karo.

**Expected request flow:** frontend request controller tak jayegi; controller validated DTO service ko dega; service repository ke through PostgreSQL read/write karegi; controller response JSON bhejega.

**Expected result:** Backend start ho aur ek API reliably database se data save/read kare. Current project mein yeh slice abhi pending hai.

### Step 4: Frontend / UI

**Kya karna hai:** Ek canonical Next.js app select karke placeholder page ko first real feature screen se replace karo.

**Kaise karna hai:**

1. Preferred baseline: `client/next-app`, kyunki isme theme aur React Query providers already root layout mein integrated hain.
2. `app/page.tsx` se first screen start karo.
3. Form/input/button component use karke API request bhejo.
4. Loading, successful response aur API error ke clear UI states add karo.
5. API base URL ko environment-specific config mein rakho, component mein hard-code mat karo.

**Expected result:** User form/action complete kare, frontend backend response show kare, aur failures understandable message dein.

### Step 5: Integration and verification

**Kya karna hai:** Database, backend aur selected frontend ko ek complete user flow mein connect karna hai.

**Kaise karna hai:**

1. `docker compose up -d` se DB healthy karo.
2. Backend run karke first endpoint ko direct verify karo.
3. Frontend run karke same endpoint ko browser action se call karo.
4. DB mein created/updated record confirm karo.
5. Invalid input aur unavailable backend/DB ka error path test karo.

**Expected result:** User action -> frontend request -> backend validation -> database update/read -> frontend result. Browser refresh ke baad persisted data expected state mein hona chahiye.

## 4. Reusable patterns from this project

### Pattern: Local pgvector database with Docker Compose

**Yeh kis problem ko solve karta hai:** Har developer ko same local PostgreSQL configuration aur vector-extension-ready database milta hai.

**Is project mein files:** `docker-compose.yml`, `docker/postgres/init-extensions.sql`.

**Naye project mein kaise adapt karna hai:** Service/container/volume/database names replace karo. Port conflict ho to host-side port change karo; container ka PostgreSQL port `5432` hi rakho. Required extensions ko init SQL mein define karo.

**Kya reuse ho sakta hai:** Service structure, health check, named volume pattern aur init-script mount directly reuse ho sakte hain.

**Kya project-specific hai:** `devguide` database name, `devguide-postgres` container name aur `devguide_pg_data` volume name.

**Common mistakes:** Typo wali Docker image, missing init SQL file, host port conflict, aur yeh expect karna ki modified init SQL existing volume par rerun ho jayegi.

### Pattern: Separate frontend and Spring Boot backend

**Yeh kis problem ko solve karta hai:** UI changes aur API/data logic ko separately build/test/evolve karna easy hota hai.

**Is project mein files:** `client/ui/` (candidate frontend), `backend/`, root Compose files.

**Naye project mein kaise adapt karna hai:** Ek frontend directory choose karo; backend mein controller-service-repository boundary rakho; frontend se API base URL configurable rakho.

**Kya reuse ho sakta hai:** Spring Boot entry-point structure, Maven Wrapper, Next.js app-router layout aur reusable shadcn components.

**Kya project-specific hai:** Abhi actual endpoint, entity, auth config aur API contract nahi hai; inhe copy nahi, new project need ke hisaab se design karna hoga.

**Common mistakes:** Multiple frontend starters ko simultaneously maintain karna, CORS/API base URL plan na karna, aur credentials ko committed config mein rakh dena.

## 5. Important decisions

### PostgreSQL ko host port `5433` par expose karna

- **Kya choose kiya:** `127.0.0.1:5433:5432` mapping.
- **Kyun:** Local machine ke common PostgreSQL `5432` port conflict ko avoid karne ke liye.
- **Kab use karein:** Jab host `5432` already occupied ho ya projects isolate rakhne hon.
- **Kab nahi:** Agar team/dev environment standardised `5432` expect karta ho aur no conflict ho.

### pgvector-enabled Postgres image

- **Kya choose kiya:** `pgvector/pgvector:pg16`.
- **Kyun:** Normal relational data ke saath future vector search capability ready milti hai.
- **Kab use karein:** Semantic search, embeddings ya similarity matching ka concrete use-case ho.
- **Kab nahi:** Simple CRUD app mein vector query ka planned use nahi ho to plain PostgreSQL simpler rahega.

### Spring Boot + Next.js split

- **Kya choose kiya:** Separate Java backend aur JavaScript frontend.
- **Kyun:** API/business logic aur user interface independently develop ho sakte hain.
- **Kab use karein:** Team/feature complexity mein dedicated API, authentication aur data layer chahiye ho.
- **Kab nahi:** Very small server-rendered prototype mein one-stack app faster ho sakta hai.

## 6. Commands I will actually need

### Database start

```powershell
docker compose up -d
```

**Kab chalani hai:** Backend se pehle, jab local database chahiye.  
**Expected result:** `devguide-postgres` background mein start hota hai.

### Database health check

```powershell
docker compose ps
```

**Kab chalani hai:** DB start ke baad ya connection issue troubleshoot karte waqt.  
**Expected result:** `postgres` service ka health status dikhta hai.

### Database stop

```powershell
docker compose down
```

**Kab chalani hai:** Local DB session end karte waqt.  
**Expected result:** Container remove hota hai; named volume ke andar data retain rehta hai.

### Backend run, test, build

```powershell
cd backend
.\mvnw.cmd spring-boot:run
.\mvnw.cmd test
.\mvnw.cmd package
```

**Kab chalani hai:** Respectively backend run, test suite, aur package build ke liye.  
**Expected result:** App start / tests run / package artifact generate. Tests H2 use karte hain; real backend start ke liye `.env` mein PostgreSQL credentials required hain. Local profile Ollama use karta hai; OpenAI ke liye `--spring.profiles.active=openai` aur `OPENAI_API_KEY` required hai.

### Candidate frontend run and quality checks

```powershell
cd client\next-app
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

**Kab chalani hai:** Dependencies install, local UI start, lint/type/build verification ke liye.  
**Expected result:** Next.js dev server start ho; checks pass hon aur production build generate ho.

## 7. Problems I should remember

### Docker Compose validate ho, par Docker config warning aaye

- **Symptom:** `docker compose config` ke waqt Windows Docker config access warning aa sakti hai.
- **Actual reason:** User-level Docker CLI config (`.docker/config.json`) read permission issue ho sakta hai; Compose YAML syntax necessarily wrong nahi hoti.
- **Fix:** Docker Desktop/CLI config permissions verify karo, phir `docker compose ps` aur actual container startup test karo.
- **Prevent:** Docker Desktop ko correct user profile mein install/run rakho aur compose validation ke baad real service health bhi check karo.

### Init extension script update ka effect nahi dikhta

- **Symptom:** `init-extensions.sql` mein line add ki, lekin existing DB mein extension/table change nahi hua.
- **Actual reason:** Docker entrypoint init scripts fresh volume par only once run hoti hain.
- **Fix:** Existing DB par intentional SQL/migration run karo. Data delete/reset sirf backup aur explicit need ke baad karo.
- **Prevent:** Schema changes ke liye jaldi Flyway/Liquibase jaisa migration path adopt karo.

### Kaunsa frontend run karna hai unclear hai

- **Symptom:** `client/next-app` aur `client/ui` dono Next.js apps hain.
- **Actual reason:** Repository mein multiple starter experiments present hain; current product baseline `client/next-app` hai.
- **Fix:** Product work se pehle ek canonical app select karo aur documentation/config usi ke around align karo.
- **Prevent:** Ek feature ke liye naya scaffold banane se pehle existing active app identify karo.

## 8. Quick rebuild checklist

- [ ] JDK 26, Docker Desktop aur Node.js/npm ready hain.
- [x] Canonical frontend: `client/next-app`.
- [ ] Backend Maven dependencies aur wrapper ready hain.
- [ ] `docker-compose.yml` aur extension init SQL available hain.
- [ ] `docker compose up -d` ke baad database healthy hai.
- [ ] `.env` secrets configure karke backend datasource local PostgreSQL se connected hai.
- [ ] First entity, repository, service aur controller ka flow working hai.
- [ ] Frontend selected API ko call karta hai.
- [ ] Valid aur invalid user flows browser se test hue hain.
