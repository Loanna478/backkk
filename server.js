const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql');
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'react'
});


db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});



app.get('/getfilms', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;

    const sql = "SELECT * FROM film LIMIT ?, ?";
    db.query(sql, [offset, limit], (err, results) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }

        const countSql = "SELECT COUNT(*) as count FROM film";
        db.query(countSql, (err, countResults) => {
            if (err) {
                return res.json({ success: false, message: err.message });
            }

            const totalFilms = countResults[0].count;
            const totalPages = Math.ceil(totalFilms / limit);

            return res.json({ success: true, films: results, totalPages });
        });
    });
});

app.get('/getfilmbyid', (req, res) => {
    const id = req.query.id;
    const sql = "SELECT * FROM film WHERE id = ?";
    db.query(sql, [id], (err, results) => {
        console.log(results);
        if (err) {
            return res.json({ success: false, message: err.message });
        }

        if (results.length === 0) {
            return res.json({ success: false, message: 'Film not found' });
        }

        return res.json({ success: true, film: results[0] });
    });
});



app.get('/getcountfilms', (req, res) => {
    const sql = "SELECT COUNT(*) as totalFilms FROM film";
    db.query(sql, (err, results) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }

        return res.json({ success: true, totalFilms: results[0].totalFilms });
    });
});

app.get('/setvuebyid', (req, res) => {
    const id = req.query.id;
    const sql = "UPDATE film SET vue = vue + 1 WHERE id = ?";
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }

        return res.json({ success: true, message: 'Vue updated successfully' });
    });
});



app.get('/getseries', (req , res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;

    const sql = "SELECT * FROM serie LIMIT ?, ?";
    db.query(sql, [offset, limit], (err, results) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }

        const countSql = "SELECT COUNT(*) as count FROM serie";
        db.query(countSql, (err, countResults) => {
            if (err) {
                return res.json({ success: false, message: err.message });
            }

            const totalSeries = countResults[0].count;
            const totalPages = Math.ceil(totalSeries / limit);

            return res.json({ success: true, series: results, totalPages });
        });
    });
}
);

app.get('/getepisodes', (req, res) => {
    const serieId = req.query.serieId;
    const sql = "SELECT episodes FROM serie WHERE id = ?";
    db.query(sql, [serieId], (err, results) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }

        return res.json({ success: true, episodes: JSON.parse(results[0].episodes) });
    });
}
);

app.get('/getcountseries', (req, res) => {
    const sql = "SELECT COUNT(*) as totalSeries FROM serie";
    db.query(sql, (err, results) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }

        return res.json({ success: true, totalSeries: results[0].totalSeries });
    });
});

app.get('/getseriebyid', (req, res) => {
    const id = req.query.id;
    const sql = "SELECT * FROM serie WHERE id = ?";
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }

        if (results.length === 0) {
            return res.json({ success: false, message: 'Serie not found' });
        }

        // Convertir la chaîne JSON en tableau d'objets
        const serie = results[0];
        serie.episodes = JSON.parse(serie.episodes);

        return res.json({ success: true, serie });
    });
});



app.get('/getepisodelink', async (req, res) => {
    const { episodeid, seriename, language } = req.query;

    // Requête SQL pour récupérer les détails de la série par son nom
    const sql = "SELECT * FROM serie WHERE name = ?";
    db.query(sql, [seriename], async (err, results) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }

        if (results.length === 0) {
            return res.json({ success: false, message: 'Serie not found' });
        }

        const serie = results[0];
        const episodes = JSON.parse(serie.episodes);

        // Recherche de l'épisode par son numéro d'épisode
        const episode = episodes.find(ep => ep.episode === episodeid && ep.language === language);

        if (!episode) {
            return res.json({ success: false, message: 'Episode not found' });
        }

        const episodeLink = episode.link;

        if (!episodeLink) {
            return res.json({ success: false, message: 'Episode link not found' });
        }

        console.log('Episode Link:', episodeLink);
        return res.json({ success: true, link: episodeLink });
    });
});



app.listen(8081, () => {
    console.log('Server running on port 8081');
});


