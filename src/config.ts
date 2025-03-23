export default () => ({
    service_name: process.env.SERVICE_NAME,
    port: parseInt(process.env.PORT || '3000', 10),
    database_uri: process.env.DATABASE_URI,
})