import app from './server.ts'

app.listen(3000, (error) => {
  if (error) {
    throw error
  }

  console.log('Server running on port 3000')
})
