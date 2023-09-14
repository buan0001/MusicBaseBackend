// CREATE TABLE artists(
//     id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
//     name VARCHAR(255) UNIQUE NOT NULL ,
//     birthdate VARCHAR(255) NOT NULL ,
//     image VARCHAR(255),
// );

// CREATE TABLE tracks(
//     id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
//     title VARCHAR(255) NOT NULL ,
//     durationSeconds INT NOT NULL ,
//     createdBy INT NOT NULL,
//     album INT ,
//     FOREIGN KEY (createdBy) REFERENCES (artists.id)
//     FOREIGN KEY (album) REFERENCES (albums.id)
// );

// CREATE TABLE albums(
//     id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
//     title VARCHAR(255) NOT NULL
//     numberOfTracks INT NOT NULL
//     artist INT NOT NULL
//     releaseYear INT
//     FOREIGN KEY (artist) REFERENCES (artists.id)
// );

// CREATE TABLE genres(
//     id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
//     genreName VARCHAR(255) NOT NULL
// );

// CREATE TABLE labels(
//     id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
//     labelName VARCHAR(255) NOT NULL
// );

// CREATE TABLE JUNCTION artists_tracks(
//     artist_id INT
//     track_id INT
//     PRIMARY KEY (track_id, artist_id)
//     FOREIGN KEY (track_id)
//     FOREIGN KEY (artist_id)
// );

// CREATE TABLE JUNCTION albums_tracks(
//     albums_id INT
//     track_id INT
//     PRIMARY KEY (track_id, albums_id)
//     FOREIGN KEY (track_id)
//     FOREIGN KEY (albums_id)
// );

// CREATE TABLE JUNCTION artists_albums(
//     artist_id INT
//     album_id INT
//     PRIMARY KEY (album_id, artist_id)
//     FOREIGN KEY (album_id)
//     FOREIGN KEY (artist_id)
// );
