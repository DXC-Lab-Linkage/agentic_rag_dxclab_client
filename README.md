# Agentic RAG chatbot(Client)

- [Agentic RAG chatbot(Client)](#agentic-rag-chatbotclient)
  - [Overview](#overview)
  - [Screen Image](#screen-image)
  - [Features](#features)
  - [Source Code](#source-code)
  - [Overview, Screen Image \& Features](#overview-screen-image--features)
  - [Environment Setup](#environment-setup)
    - [Checking Node.js Version](#checking-nodejs-version)
    - [Installing Required OSS](#installing-required-oss)
  - [Starting the Application](#starting-the-application)
    - [Starting the Backend](#starting-the-backend)
    - [Starting the Frontend](#starting-the-frontend)
    - [Verifying Operation](#verifying-operation)

## Overview

\* Japanese Guide: [README_ja.md](/README_ja.md)

- This is an Agentic RAG chatbot that effectively leverages internal company information and enables flexible thinking. Based on LangGraph, the AI Agent autonomously creates work plans and tasks, and provides optimal responses through RAG using web searches and a Vector DB. Unlike traditional one-question-one-answer systems, conversations and additional analyses can continue even after an answer is given. RAG is positioned as one of the tools the Agent invokes, much like web search.
- The Plan & Execution Agent pattern is also implemented, allowing the Agent to create its own search plan and execute appropriate search tools. This enables the collection of information from multiple angles in a systematic manner.

## Screen Image

On the left is the chatbot. On the right, the AI Agent’s thought process is displayed in real time.

![Screen image](/readme_images/screen_image.png)

## Features

- Since leaving operations entirely to the LLM can sometimes prevent convergence, we strictly manage the status of plans and set a maximum number of plans to ensure convergence.
- We extract and use only the necessary messages from AI messages and tool messages. By minimizing the messages the Agent references, costs can be reduced.
- By introducing the Plan & Execute pattern to create plans, information can be collected from multiple perspectives in a structured manner.
- AI agent can handle complex requests containing multiple items, resulting in structured responses.  
  Example: Collect technical information on Company A → Collect technical information on Company B → Compare technical information of Companies A and B.
- We use LangGraph. Since it can construct complex flows, it allows for customization to meet detailed requirements.
- A tool for searching arXiv papers is registered as one of the tool calling functions. Based on the user’s request, the Agent creates an arXiv search query and performs the search.

## Source Code

The code is divided into two parts: frontend ([agentic_rag_client](https://github.com/DXC-Lab-Linkage/agentic_rag_dxclab_client) ) and backend ([agentic_rag_server](https://github.com/DXC-Lab-Linkage/agentic_rag_dxclab_server)). The code in this repository is the frontend code.

## Overview, Screen Image & Features

The overview, screen image, and features are described in the `README.md` of the server-side code `agentic_rag_server`.

## Environment Setup

Follow the steps below to set up the client-side environment.

### Checking Node.js Version

Node.js has been confirmed to work with versions 18.17.0 and 20.18.0.

### Installing Required OSS

Run the following command in the root folder to install the required OSS:

```bash
npm install
```

## Starting the Application

Follow the steps below to start the application.

### Starting the Backend

- In the root folder of the backend code, run:

```bash
uvicorn main:app
```

- The server will start at `http://127.0.0.1:8000`.

### Starting the Frontend

- In the root folder of the frontend code, run:

```bash
npm run dev
```

- Once the frontend has started, open your browser and go to `http://localhost:3000/` to view the chatbot interface.

### Verifying Operation

- Enter a query in the question input field and click the submit button to check that the LLM returns a response properly.
  Example: Enter "Hello” and confirm that a response is returned.
- To verify the RAG functionality, ask the following question:
  "Compare Fic-GreenLife and Fic-NextFood from a technical perspective and summarize concisely." Ensure that a proper response is returned.

\* Note: The Vector DB contains information for three fictitious companies: "Fic-GreenLife”, "Fic-NextFood”, and "Fic-TechFrontier”. Fic means "Fiction".
