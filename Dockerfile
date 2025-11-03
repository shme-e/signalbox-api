FROM denoland/deno:latest

WORKDIR /app

COPY . .

RUN deno cache main.ts

ENV AUTH=${AUTH}

CMD ["deno", "run", "--allow-net", "--allow-env", "main.ts"]