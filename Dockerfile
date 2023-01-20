FROM --platform=linux/arm64/v8 node:16.19.0-bullseye-slim as base

RUN apt-get update && \
    apt-get install --no-install-recommends -y \
        build-essential \
        python3 && \
    rm -fr /var/lib/apt/lists/* && \
    rm -rf /etc/apt/sources.list.d/*

#RUN npm install --global --quiet npm truffle ganache
RUN npm install -g truffle
RUN npm install -g ganache

FROM base as truffle

RUN mkdir -p /home/app
WORKDIR /home/app

COPY package.json /home/app
COPY package-lock.json /home/app

RUN npm install

COPY build_deploy.sh /home/app
COPY truffle-config.js /home/app
COPY contracts /home/app/contracts
COPY migrations /home/app/migrations/
COPY test /home/app/test/

#CMD ["truffle", "version"]
CMD ["./build_deploy.sh"]

FROM base as ganache

RUN mkdir -p /home
WORKDIR /home
EXPOSE 8545

ENTRYPOINT ["ganache-cli","-h","0.0.0.0","-p", "8545", "--deterministic"]
