const bcrypt = require('bcrypt')

const getPasswordHash = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10)
        return await bcrypt.hash(password, salt)        
    } catch (error) {
        throw error
    }
}

const checkPassword = async (password, password_hash) => {
    try {
        return await bcrypt.compare(password, password_hash)
    } catch (error) {
        throw error
    }
}

module.exports = {
    getPasswordHash,
    checkPassword
}