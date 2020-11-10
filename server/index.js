require('dotenv').config()

import app from './app'
const port = process.env.PORT || 3000

// eslint-disable-next-line
app.listen(port, () => console.log(`
    =========================================
    |  LMAx Koa is running on port ${port}  |
    =========================================
`))
