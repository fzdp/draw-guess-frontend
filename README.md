frontend source code of the pictionary website [https://www.udig.online](https://www.udig.online).

|ready|choose word|draw|
|:---:|:---:|:---:|
|![ready](https://user-images.githubusercontent.com/6159178/119751236-5cd57c00-becd-11eb-8741-4e2257bf3f47.png)|![choose word](https://user-images.githubusercontent.com/6159178/119752151-08cb9700-becf-11eb-9106-765477615152.png)|![draw](https://user-images.githubusercontent.com/6159178/119752191-1f71ee00-becf-11eb-992c-fb392b54cb95.png)|

# setup
(1) make sure backend server is running, see [https://github.com/fzdp/draw-guess-server](https://github.com/fzdp/draw-guess-server)

(2) edit env file and change env variables if needed
```shell
mv .env.development.local.example .env.development.local
```

(3) install and run locally
```shell
npm install
npm run serve
```
