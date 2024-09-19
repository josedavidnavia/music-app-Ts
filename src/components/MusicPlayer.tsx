import React, { useState, useRef } from 'react';
import axios from 'axios';
import './MusicPlayer.css';

interface Song {
  id: number;
  title: string;
  artist: { name: string };
  album: { cover: string };
  preview: string;
}

const MusicPlayer: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Función para buscar canciones desde la API
  const fetchSongs = async (searchQuery: string) => {
    const options = {
      method: 'GET',
      url: `https://deezerdevs-deezer.p.rapidapi.com/search?q=${encodeURIComponent(searchQuery)}`,
      headers: {
        'X-RapidAPI-Key': 'd63942416cmsh8835f972ab220c0p1a8baejsn68a79b3b0dfe',
        'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com',
      },
    };

    try {
      const response = await axios.request(options);
      if (response.status === 200 && response.data.data) {
        setSongs(response.data.data); // Almacenar canciones encontradas
        setError('');
      } else {
        setError('No se encontraron canciones.');
        setSongs([]);
      }
    } catch (error: any) {
      setError('Error buscando canciones: ' + error.message);
      setSongs([]);
    }
  };

  // Manejo del input de búsqueda
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value) {
      fetchSongs(e.target.value);
    } else {
      setSongs([]);
    }
  };

  // Función para seleccionar una canción del listado
  const selectSong = (index: number) => {
    setCurrentSongIndex(index); // Establecer la canción seleccionada
    setIsPlaying(false); // Pausar la canción al seleccionar una nueva
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // Función para manejar la reproducción/pausa de la canción
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Función para reproducir la canción anterior
  const playPrevious = () => {
    if (currentSongIndex !== null && currentSongIndex > 0) {
      selectSong(currentSongIndex - 1);
    }
  };

  // Función para reproducir la siguiente canción
  const playNext = () => {
    if (currentSongIndex !== null && currentSongIndex < songs.length - 1) {
      selectSong(currentSongIndex + 1);
    }
  };

  // Renderizado de la canción seleccionada con controles
  const renderSelectedSong = () => {
    if (currentSongIndex !== null && songs[currentSongIndex]) {
      const currentSong = songs[currentSongIndex];
      return (
        <div className="selected-song">
          <img src={currentSong.album.cover} alt={currentSong.title} className="album-cover" />
          <h3>{currentSong.title} - {currentSong.artist.name}</h3>

          <audio
            ref={audioRef}
            src={currentSong.preview}
            onEnded={playNext} // Reproduce la siguiente cuando la canción actual termina
            controls
          />

          <div className="controls">
            <button onClick={playPrevious}>⏮️ Anterior</button>
            <button onClick={togglePlayPause}>{isPlaying ? '⏸️ Pausa' : '▶️ Play'}</button>
            <button onClick={playNext}>⏭️ Siguiente</button>
          </div>
        </div>
      );
    }
    return null; // No renderizar nada si no hay una canción seleccionada
  };

  return (
    <div className="music-player">
      {renderSelectedSong()} {/* Renderizar la canción seleccionada con controles */}

      <input
        type="text"
        placeholder="Buscar canciones"
        value={query}
        onChange={handleInputChange}
        className="search-input"
      />

      <div className="song-list">
        {songs.length > 0 && (
          songs.map((song, index) => (
            <div
              key={song.id}
              className="song-item"
              onClick={() => selectSong(index)}
              style={{
                cursor: 'pointer',
                backgroundColor: currentSongIndex === index ? '#e0e0e0' : 'white',
              }}
            >
              <img src={song.album.cover} alt={song.title} />
              <div>
                <p>{song.title}</p>
                <p>{song.artist.name}</p>
              </div>
            </div>
          ))
        )}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default MusicPlayer;
