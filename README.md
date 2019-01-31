[TDLib](https://core.telegram.org/tdlib/getting-started) (Telegram Database library) authentication example by [tdl](https://github.com/Bannerets/tdl) (Node.js pakage)

The user login data (Phone number and authentication code) send with [Telegram Bot](https://core.telegram.org/bots).


### Table of Contents

- [Getting started](#getting-started)
- [Test](#test)

---

<a name="getting-started"></a>
### Getting started

1. Build the binary (https://github.com/tdlib/td#building)
> You can also use prebuilt binaries: [tdlib.native](https://github.com/ForNeVeR/tdlib.native/releases)

2. `git clone https://github.com/mortezaataiy/nodejs-tdlib-login-example.git`
3. initial config.js file (like config-example.js)
4. `npm install`
5. `npm start`
---

<a name="test"></a>
### Test

1. Send `/start` in Api bot
2. The bot want you to send phone number like this:
`/send c+123456789012`
> char 'c' need!

3. The bot want you to send code like this:
`/send c12345`
>char 'c' need!
(if send code without a char with telegram the code has expired!)

4. The bot want you to send password like this if needed:
`/send c12345`
>char 'c' need!

5. Now you receive "Ready" and now you can test cli bot with:

6. Send `Ping` in private(saved messages) in your telegram account

7. now you see send automatic "Pong" after "ping" :)
