FROM node:18.17-bullseye

# Install required tools and dependencies for glibc installation
RUN apt-get update && apt-get install -y \
    wget unzip gawk bison build-essential \
    libtool texinfo manpages-dev

# Install the required glibc version
RUN wget -q -O /tmp/glibc-2.38.tar.gz https://ftp.gnu.org/gnu/libc/glibc-2.38.tar.gz \
    && tar -xzf /tmp/glibc-2.38.tar.gz -C /tmp \
    && cd /tmp/glibc-2.38 \
    && mkdir build && cd build \
    && ../configure --prefix=/opt/glibc-2.38 > /tmp/configure.log 2>&1 \
    && make -j$(nproc) > /tmp/make.log 2>&1 || (echo "Build failed"; cat /tmp/make.log; exit 1) \
    && make install > /tmp/make_install.log 2>&1 || (echo "Install failed"; cat /tmp/make_install.log; exit 1) \
    && echo "/opt/glibc-2.38/lib" > /etc/ld.so.conf.d/glibc-2.38.conf \
    && ldconfig \
    && rm -rf /tmp/glibc-2.38 /tmp/glibc-2.38.tar.gz

# Set working directory and install dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

CMD ["node", "app.js"]
