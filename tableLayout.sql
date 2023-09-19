DROP DATABASE musicDB;
CREATE DATABASE musicDB;
use musicDB;

DROP TABLE albums_tracks, artists_albums, artists_tracks, artists, tracks, albums;

CREATE TABLE artists(
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL ,
    birthdate VARCHAR(255) NOT NULL
);

CREATE TABLE tracks(
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL ,
    durationSeconds INT NOT NULL
);

CREATE TABLE albums(
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    releaseYear INT
);


CREATE TABLE genres(
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    genreName VARCHAR(255)
);

CREATE TABLE labels(
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    labelName VARCHAR(255) NOT NULL
);

CREATE TABLE artists_tracks(
    id INT primary key auto_increment,
    artist_id INT,
    track_id INT,
    FOREIGN KEY (track_id) REFERENCES tracks(id),
    FOREIGN KEY (artist_id) REFERENCES artists(id)
);

CREATE TABLE albums_tracks(
    id INT primary key auto_increment,
    albums_id INT,
    track_id INT,
    FOREIGN KEY (track_id) REFERENCES tracks(id),
    FOREIGN KEY (albums_id) REFERENCES albums(id)
);

CREATE TABLE artists_albums(
    id INT primary key auto_increment,
    artist_id INT,
    album_id INT,
    FOREIGN KEY (album_id) REFERENCES albums(id),
    FOREIGN KEY (artist_id) REFERENCES artists(id)
);



INSERT INTO artists (name, birthdate)
values ('Rihanna', '1986-03-04'),
       ('Eminem', '1991-02-01'),
       ('Mr. world wide', '1981-09-11'),
       ('Netsky', '1990-08-08');

INSERT INTO albums (title, releaseYear)
VALUES ('Rihanna album 1', 2014),
       ('Rihanna album 2', 2019),
       ('Eminem album 1', 2004),
       ('Eminem album 2', 2010),
       ('Pitbull album 1', 2008),
       ('Pitbull album 2', 2012),
       ('Netsky album 1', 2004),
       ('Netsky album 2', 2008),
       ('Netsky album 3', 2014);

INSERT INTO tracks (title, durationSeconds)
values ('Rihanna track 1', '201'),
('Rihanna track 2', '188'),
('Rihanna track 3', '244'),
('EMINEM track 1', '144'),
('EMINEM track 2', '202'),
('EMINEM track 3', '251'),
('Pitbull track 1', '99'),
('Pitbull track 2', '159'),
('Pitbull track 3', '311'),
('Netsky track 1', '488'),
('Netsky track 2', '401'),
('Netsky track 3', '297');

INSERT INTO artists_tracks (artist_id, track_id)
VALUES (1,1),
(1,2),
(1,3),
(2,4),
(2,5),
(2,6),
(3,7),
(3,8),
(3,9),
(4,10),
(4,11),
(4,12);

SELECT artists.name, artists.birthdate, tracks.title, tracks.durationSeconds FROM artists
JOIN artists_tracks ON artists.id = artists_tracks.artist_id
JOIN tracks ON artists_tracks.track_id = tracks.id;