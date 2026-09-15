CodeSense

<p align="center">
  <strong>AI-Powered Codebase Intelligence Platform</strong><br/>
  <em>Make Sense of Any Codebase.</em>
</p>

About CodeSense

CodeSense helps developers understand unfamiliar GitHub repositories using semantic search, Retrieval-Augmented Generation (RAG), and repository-aware AI chat.

Instead of sending the entire repository to an AI model for every question, CodeSense first indexes the codebase into a searchable vector knowledge base. When a user asks a question, only the most relevant code is retrieved and provided to the AI model.

Status: Working prototype under active development.

The Problem

Understanding an unfamiliar codebase takes time.

A developer may need to manually:

explore folders and files,

trace authentication and data flow,

find where a feature is implemented,

identify entry points and configuration,

understand relationships between modules,

repeatedly search through hundreds of files.

Traditional keyword search finds exact text, but it does not always answer conceptual questions such as:

“Where is authentication handled?”
“How does repository indexing work?”
“Which files are responsible for this feature?”
“Explain the architecture of this project.”

CodeSense turns a GitHub repository into an interactive AI knowledge base.

How CodeSense Works

The complete workflow has two stages:

Index the repository once

Ask questions many times

flowchart TB

    subgraph S1["STEP 1 — Connect Repository"]
        A["Sign in with GitHub"] --> B["Choose Repository"]
        B --> C["Fetch Repository Source"]
    end

    subgraph S2["STEP 2 — Build Knowledge Base"]
        C --> D["Filter Useful Files"]
        D --> E["Split Code into Chunks"]
        E --> F["Generate Embeddings"]
        F --> G[("PGVector Knowledge Base")]
    end

    subgraph S3["STEP 3 — Ask a Question"]
        H["Developer asks a question"] --> I["Search Relevant Code"]
        G --> I
        I --> J["Build RAG Context"]
    end

    subgraph S4["STEP 4 — Generate Answer"]
        J --> K["AI Chat Model"]
        K --> L["Repository-Grounded Answer"]
        L --> M["Source Citations"]
        M --> N["Stream Answer to UI"]
    end

In simple words

GitHub Repository
      ↓
Index useful code once
      ↓
Store searchable knowledge in PGVector
      ↓
User asks a question
      ↓
Find only the most relevant code
      ↓
Give that code to the AI
      ↓
Return an answer with repository context

System Architecture

flowchart LR

    USER["User"]

    subgraph FRONTEND["Frontend"]
        UI["Next.js + TypeScript"]
    end

    subgraph BACKEND["Spring Boot Backend"]
        API["REST APIs"]
        AUTH["GitHub OAuth2"]
        INDEX["Indexing Service"]
        RAG["RAG / Chat Service"]
        SSE["SSE Streaming"]
    end

    subgraph DATA["Data Layer"]
        DB[("PostgreSQL")]
        VECTOR[("PGVector")]
    end

    subgraph EXTERNAL["External / AI Services"]
        GITHUB["GitHub API"]
        EMB["Embedding Model"]
        LLM["Chat Model"]
    end

    USER --> UI
    UI --> API

    API --> AUTH
    AUTH --> GITHUB

    API --> INDEX
    INDEX --> GITHUB
    INDEX --> EMB
    EMB --> VECTOR

    API --> RAG
    RAG --> VECTOR
    RAG --> LLM

    API --> DB
    RAG --> DB

    LLM --> SSE
    SSE --> UI

Responsibility of each layer

Layer

Responsibility

Frontend

Login, repositories, indexing progress, chat UI

Spring Boot Backend

Authentication, repository operations, indexing, RAG, chat

GitHub API

Repository metadata and source access

Embedding Model

Converts code and questions into semantic vectors

PGVector

Stores and searches repository embeddings

Chat Model

Generates answers from retrieved repository context

PostgreSQL

Stores users, repositories, chats and application data

SSE

Streams AI responses to the frontend

RAG Explained

RAG stands for Retrieval-Augmented Generation.

CodeSense does not blindly ask the AI model to understand the whole repository every time.

It first retrieves the most relevant code.

A. Repository Indexing

This happens when a repository is indexed.

flowchart LR
    A["Source Files"] --> B["Filter"]
    B --> C["Chunk Code"]
    C --> D["Create Embeddings"]
    D --> E[("PGVector")]

Example:

UserService.java
SecurityConfig.java
ChatService.java
        ↓
small searchable chunks
        ↓
semantic vectors
        ↓
PGVector

B. Question Answering

This happens whenever the developer asks a question.

flowchart LR
    Q["User Question"] --> QE["Question Embedding"]
    QE --> SEARCH["Similarity Search"]
    DB[("PGVector")] --> SEARCH
    SEARCH --> CODE["Top Relevant Code Chunks"]
    CODE --> PROMPT["Question + Retrieved Code"]
    PROMPT --> AI["Chat Model"]
    AI --> ANSWER["Grounded Answer + Citations"]

Example

Question:
"How does GitHub login work?"
        ↓
CodeSense searches PGVector
        ↓
Finds:
SecurityConfig.java
GithubOAuth2UserService.java
AuthController.java
        ↓
Only this relevant context goes to the AI
        ↓
Repository-specific explanation

Repository Isolation

Each repository has its own indexed context.

flowchart TB
    USER["Authenticated User"]

    USER --> RA["Repository A"]
    USER --> RB["Repository B"]

    RA --> VA[("Vectors: Repo A")]
    RB --> VB[("Vectors: Repo B")]

    QA["Chat: Repo A"] --> VA
    QB["Chat: Repo B"] --> VB

A chat for Repository A should only retrieve vectors belonging to Repository A.

GitHub Authentication

sequenceDiagram
    actor User
    participant UI as CodeSense Frontend
    participant API as Spring Boot Backend
    participant GH as GitHub

    User->>UI: Click "Sign in with GitHub"
    UI->>API: Start OAuth login
    API->>GH: Redirect for authorization
    GH->>User: Ask for permission
    User->>GH: Approve
    GH->>API: OAuth callback
    API->>API: Create authenticated session
    API->>UI: Redirect to CodeSense
    UI->>API: Request current user
    API-->>UI: User authenticated

GitHub credentials are not collected directly by CodeSense.

Core Features

Implemented

GitHub OAuth2 login

Authenticated user sessions

Repository synchronization

Repository selection

Source-file fetching

Code-file filtering

Code chunking

Semantic embeddings

PostgreSQL + PGVector

Repository-scoped vector retrieval

RAG-based chat

Source citations

SSE streaming

Chat/session persistence

Indexing progress tracking

Indexing failure states

Repository isolation

Local Ollama-based AI

Planned / In Progress

Add Repository by URL

Commit-SHA-pinned indexing

Commit-addressed GitHub archive ingestion

Repository overview

Better line-level citations

Function/class-aware chunking

Hybrid semantic + keyword retrieval

Incremental re-indexing

Hosted OpenAI / Gemini provider option

Architecture/dependency visualization

Pull-request understanding

Change-impact analysis

Tech Stack

Area

Technology

Frontend

Next.js + TypeScript

Backend

Spring Boot

Security

Spring Security

Authentication

GitHub OAuth2

Database

PostgreSQL

Vector Database

PGVector

Current Embedding Model

nomic-embed-text via Ollama

Current Chat Model

qwen3.5:2b via Ollama

Streaming

Server-Sent Events

Local Infrastructure

Docker Compose

Current AI Setup

Chat Model       → qwen3.5:2b
Embedding Model  → nomic-embed-text
Vector Store     → PostgreSQL + PGVector
Vector Dimension → 768

The AI layer is replaceable.

For cloud deployment, CodeSense can later use hosted models such as OpenAI or Gemini while keeping the same repository → retrieval → RAG architecture.

Planned Feature — Add Repository by URL

The goal is to allow a user to paste a GitHub repository URL instead of only selecting repositories from the synchronized GitHub account list.

flowchart TB
    A["Paste GitHub Repository URL"]
    B["Validate github.com URL"]
    C["Extract owner / repository"]
    D["Fetch canonical repository metadata"]
    E{"User has access?"}
    F["Show safe access error"]
    G["Resolve exact commit SHA"]
    H["Download source snapshot"]
    I["Apply file filtering"]
    J["Reuse existing indexing pipeline"]
    K[("PGVector")]
    L["Repository ready for chat"]

    A --> B
    B --> C
    C --> D
    D --> E

    E -- No --> F
    E -- Yes --> G

    G --> H
    H --> I
    I --> J
    J --> K
    K --> L

Why pin the exact commit?

A branch such as main keeps changing.

main
 ├── Commit A
 ├── Commit B
 └── Commit C

CodeSense should resolve the current branch to one exact commit:

main
  ↓
Commit SHA: abc123...
  ↓
Index this exact source snapshot

Benefits:

consistent indexing,

stable source version,

better citations,

easier future update detection.

Project Structure

CodeSense/
│
├── backend/
│   └── Spring Boot backend
│
├── client/
│   └── Next.js frontend
│
├── docker/
│   └── PostgreSQL / PGVector setup
│
├── compose.yml / docker-compose.yml
├── README.md
├── LICENSE.md
└── .env

.env must not be committed.

Local Setup

Requirements

Install:

Git

Docker Desktop

Node.js + npm

Java / JDK compatible with the backend

Ollama

1. Clone

git clone <YOUR_REPOSITORY_URL>
cd CodeSense

2. Environment Variables

Create the required local .env file.

DATABASE_URL=jdbc:postgresql://localhost:5433/devguide
DATABASE_USERNAME=devguide
DATABASE_PASSWORD=<YOUR_DATABASE_PASSWORD>
POSTGRES_PASSWORD=<YOUR_DATABASE_PASSWORD>

GITHUB_CLIENT_ID=<YOUR_GITHUB_CLIENT_ID>
GITHUB_CLIENT_SECRET=<YOUR_GITHUB_CLIENT_SECRET>

TOKEN_ENCRYPTION_PASSWORD=<YOUR_ENCRYPTION_PASSWORD>
TOKEN_ENCRYPTION_SALT=<16_HEX_CHARACTERS>

FRONTEND_URL=http://localhost:3000

Never put actual secrets in the repository.

3. Start PostgreSQL + PGVector

docker compose up -d

Check:

docker compose ps

4. Prepare Ollama

ollama pull qwen3.5:2b
ollama pull nomic-embed-text

Ensure Ollama is running before indexing.

5. Start Backend

cd backend

Windows PowerShell:

.\mvnw spring-boot:run

6. Start Frontend

Open another terminal:

cd client
npm install
npm run dev

Open:

http://localhost:3000

GitHub OAuth Configuration

For local development:

Homepage URL
http://localhost:3000

Authorization Callback URL
http://localhost:8080/login/oauth2/code/github

Keep the OAuth client secret only on the backend.

Security

CodeSense works with source code and GitHub authorization data.

Important practices:

GitHub access tokens stay on the backend.

Stored tokens should remain encrypted.

Repository access is checked server-side.

Retrieval is scoped to the active repository.

Private repository content must remain isolated.

Repository files are treated as untrusted data.

AI models should treat repository text as evidence, not system instructions.

API keys and secrets belong in environment variables or a secret manager.

Never commit

.env
.env.local
API keys
GitHub access tokens
OAuth client secrets
database passwords
encryption passwords
encryption salts

Deployment Direction

Current Local Architecture

flowchart LR
    UI["Next.js"] --> API["Spring Boot"]
    API --> DB[("PostgreSQL + PGVector")]
    API --> OLLAMA["Ollama"]
    API --> GH["GitHub API"]

This keeps AI inference local but requires enough CPU/GPU/RAM on the deployment machine.

Cloud-Friendly Architecture

flowchart LR
    UI["Next.js Frontend"] --> API["Spring Boot Backend"]
    API --> DB[("Managed PostgreSQL + PGVector")]
    API --> EMB["Hosted Embedding API"]
    API --> LLM["Hosted Chat API"]
    API --> GH["GitHub API"]

A hosted provider such as OpenAI or Gemini can remove the need to run Ollama on the production server.

Roadmap

Near Term

Add Repository by URL

Commit-SHA-pinned indexing

Safe source archive ingestion

Better line-level citations

Repository overview

Improve architecture-level retrieval

Hosted AI provider option

Future

Function/class-aware chunks

Hybrid semantic + keyword search

Symbol-aware retrieval

Incremental indexing

Dependency graph

Architecture visualization

Pull-request explanation

Change-impact analysis

Team workspaces

Use Cases

CodeSense can help with:

onboarding into unfamiliar codebases,

understanding project architecture,

tracing authentication and data flow,

locating feature implementations,

exploring open-source repositories,

studying real-world projects,

technical codebase review,

repository-specific Q&A,

maintaining long-lived software.

License

CodeSense is source-available for evaluation and portfolio review, not open source.

See LICENSE.md for complete terms.

Unauthorized copying of substantial project code, redistribution, commercial use, resale, or reuse of substantial implementation in a competing or substantially similar product is not permitted without prior written permission.

Third-party dependencies remain governed by their own licenses.

Disclaimer

CodeSense is under active development.

AI-generated explanations may be incomplete or inaccurate. Security-critical or production-critical decisions should always be verified directly against the source code.

<p align="center">
  <strong>CodeSense</strong><br/>
  <em>Make Sense of Any Codebase.</em>
</p>
