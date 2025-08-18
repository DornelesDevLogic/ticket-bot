import React, { useState } from 'react'
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Container,
  Paper
} from '@mui/material'
import axios from 'axios';

const EvaluationPage: React.FC = () => {
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState<string>('')
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [errorDisplay, setErrorDisplay] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('Sem resposta do servidor')

  const handleSubmit = async () => {
    const payload = {
      rating,
      comment,
      token: new URLSearchParams(window.location.search).get('token')
    }

    axios.post('/api/avaliacao', payload)
      .then(() => {
        setSubmitted(true);
      })
      .catch((error) => {
        console.log(error);
        setErrorDisplay(true);
        setErrorMessage(`Erro ${error.response.status}: ${error.response.data}`);
      });
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
          {submitted ? (
            <>
              <Typography variant="h5" gutterBottom>
                Obrigado pela sua avaliação! 💙
              </Typography>
              <Typography variant="body1">
                Sua opinião é muito importante para nós.
              </Typography>
            </>
          ) : errorDisplay ? (
            <>
              <Typography variant="h5" gutterBottom>
                Ops. Um erro ocorreu.
              </Typography>
                
              <Typography variant="body1">
                {errorMessage}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h5" gutterBottom>
                Avalie seu atendimento
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2, justifyContent: 'center' }}>
                <Typography component="legend" sx={{ marginRight: 2 }}>
                  Nota:
                </Typography>
                <Rating
                  name="rating"
                  value={rating}
                  onChange={(_, newValue) => setRating(newValue)}
                />
              </Box>

              <TextField
                label="Comentário"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ marginBottom: 3 }}
              />

              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={rating === null}
                fullWidth
              >
                Enviar
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  )
}

export default EvaluationPage
