const app = require('express')();
const jimp = require('jimp');
const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');

app.get('/', (req, res) => {
  res.send('it works');
});

app.get('/github-pro/:id', async (req, res) => {
  const { params: { id }} = req;

  const profileUrl = `https://github.com/${id}`;

  console.log(id);

  try {
    const { status: profileStatus, data: profileHtml } = await axios.get(profileUrl);

    const $ = cheerio.load(profileHtml);
    const imgUrl = $('a.u-photo.d-block').attr('href');

    const { status: imageStatus, data: imageRaw } = await axios.get(imgUrl, { responseType: 'arraybuffer' });

    fs.writeFileSync(`${id}.jpeg`, imageRaw);
  } catch (err) {
    console.log(err);
  }

  Promise.all([
    jimp.read(`${id}.jpeg`),
    jimp.read('pro_banner.png')
  ])
    .then(([profileImage, banner]) => {
      profileImage.composite(banner, 0, 300);
      return profileImage.writeAsync(`${id}_result.jpeg`);
    })
    .then(() => {
      res.download(`${id}_result.jpeg`, 'result.jpeg');
    })
    .catch(console.log);
});

app.listen(4000);
