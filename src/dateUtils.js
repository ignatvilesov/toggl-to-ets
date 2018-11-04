/**
 * Returns formatted date as "YYYY-MM-DD"
 * @param {Date} date 
 */
function formatDate(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

module.exports = {
    formatDate,
};