import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Rating } from '@mui/material';
import { CardActionArea, CardActions, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { getFilmById } from '../api/films';
import { getUserData } from '../api/auth';
import { getAllContextsForFilm } from '../api/contexts';
import { averageRating } from '../lib/favourites';
import { createContextRating } from '../api/contexts';

const ShowFilm = () => {
  const { filmId } = useParams();
  const [film, setFilm] = React.useState(null);
  const [filmContexts, setFilmContexts] = React.useState(null);
  const [userData, setUserData] = React.useState(null);

  React.useEffect(() => {
    const getData = async () => {
      const filmdata = await getFilmById(filmId);
      setFilm(filmdata);

      const contextData = await getAllContextsForFilm(filmId);
      setFilmContexts(contextData);
      if (window.sessionStorage.token) {
        const user = await getUserData();
        setUserData(user);
      }
    };
    getData();
  }, []);

  if (!film) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Container maxWidth="sm" className="bg-slate-200 shadow">
        <h1 className="font-semibold text-center p-5">{film.title}</h1>
        <div className="image justify-center">
          <figure>
            <img src={film.image} alt={film.title} />
          </figure>
        </div>
        <div className="flex justify-center">
          <div className="information card">
            <p>
              <strong>Director:</strong> {film.director}
            </p>
            <p>
              <strong>Released in:</strong> {film.year}
            </p>
            <div className="film-info">
              <strong>Songs that Appear in {film.title}:</strong>
              {film.songs.map((song) => (
                <Card
                  key={song.name}
                  sx={{ maxWidth: 400, maxHeight: 300, width: '100%' }}
                  className="m-1 justify-center flex-col"
                >
                  <CardActionArea>
                    <Link to={`/songs/${song.id}`}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={song.album.image}
                        alt={song.name}
                        sx={{ maxHeight: 100, maxWidth: 100 }}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                          {song.name}
                        </Typography>

                        {filmContexts
                          ?.filter((item) => item.film.id === film.id)

                          .map((context) => (
                            <Typography
                              key={context.id}
                              variant="body2"
                              color="text.secondary"
                            >
                              {context.usage}
                              <br />
                              Average Rating: {averageRating(context)}
                            </Typography>
                          ))}
                      </CardContent>
                    </Link>
                  </CardActionArea>
                  {userData && (
                    <CardActions>
                      {filmContexts
                        ?.filter((item) => item.film.id === film.id)

                        .map((context) => (
                          <Rating
                            key={context.id}
                            name="no-value"
                            value={null}
                            max={10}
                            onChange={async (event, newValue) => {
                              createContextRating({
                                usage: context.id,
                                rating: newValue,
                              });
                              const contextData = await getAllContextsForFilm(
                                filmId
                              );
                              setFilmContexts(contextData);
                            }}
                          />
                        ))}
                    </CardActions>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default ShowFilm;
