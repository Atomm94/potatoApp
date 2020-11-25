const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
    let salt = await bcrypt.genSaltSync(10);
    let hash = await bcrypt.hashSync(password, salt);
    return hash;
}

const comparePassword = async (newPassword, password) => {
    let compare = await bcrypt.compareSync(newPassword, password);
    return compare;
}

module.exports = {
    hashPassword,
    comparePassword
}