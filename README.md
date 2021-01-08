A simple example of [TDLib](https://core.telegram.org/tdlib/getting-started) (Telegram Database Library) authentication using [tdl](https://github.com/Bannerets/tdl) (Node.js package)

User login information (phone number and authentication code) is sent by [Telegram API Bot](https://core.telegram.org/bots).

After successfully logging in, if you send "Ping" in your private chat, you will see that "Pong" will be sent automatically

![TDLib nodejs authentication example](https://raw.githubusercontent.com/mortezaataiy/nodejs-tdlib-login-example/master/output.gif)

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

1. Send `/start` in your Api bot (that you set token in config file)
2. The bot want you to send phone number like this:
`/send c+123456789012`
> char 'c' need!

3. The bot want you to send auth code like this: (The code that Telegram sent you to log in)
`/send c12345`
>char 'c' need!
(if send code without a char with telegram the code has expired!)

4. The bot want you to send password like this if needed: (If Two-Step Verification is actived)
`/send c12345`
>char 'c' need!

5. Now you receive "Ready" and now you can test cli bot with:

6. Send `Ping` in private(saved messages) in your telegram account

7. you will see that "Pong" will be sent automatically :)


### If you have a problem, send an issue
