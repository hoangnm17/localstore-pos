const bcrypt = require('bcrypt');
(async () => {
    const hash = '$2a$12$73feLBzNo7tbP422IqhhjuO34fQzzMPbFajH0VFjVoqZa/QgRJdXK';
    const isMatch = await bcrypt.compare('123456', hash);
    console.log(`Is 123456 a match? ${isMatch}`);
})();
