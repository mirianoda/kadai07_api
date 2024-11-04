const key = '********';

//気分に合わせておすすめ映画を表示する関数
function displayRecommendations(mood) {
    let genre;
    if (mood === "joy") {
        genre = "12,35,878"; // 冒険、コメディ、SF
    } else if (mood === "sad") {
        genre = "18,10751,10749"; // ドラマ、ファミリー、ロマンス
    } else if (mood === "anger") {
        genre = "28,27,9648,53"; // アクション、ホラー、ミステリー、サスペンス
    } else {
        genre = "16,80,10402"; //アニメーション、ドキュメンタリー、音楽
    }
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&with_genres=${genre}&sort_by=popularity.desc&language=ja`
    
    $.ajax({
        url:url,
        type:'get',
        cache:false,
        dataType:'json'
    }).done(function(data){
        // console.log(data.list[0].dt_txt); //オブジェクト変数を確認
        console.log(data.results[0].title); //オブジェクト変数を確認
        console.log(data); //オブジェクト変数を確認
    
         let html=""; 
         for(let i=0; i<data.results.length; i++){
             html += `
                <div class="item_box">
                    <a class="item_link" href="#">
                      <div class="item_content">
                      <div class="item_image">
                      <img src="https://image.tmdb.org/t/p/w500/${data.results[i].poster_path}">
                      </div>
                      <div class="item_mask">
                      <div class="item_mask-text">
                      <p>${data.results[i].overview}</p>
                      <p>${data.results[i].release_date}公開</p>
                      </div>
                      </div>
                      </div>
                      </a>
                      <h4>${data.results[i].title}</h4>
                </div>
               `;
           }
        //作成したHTML埋め込む
         $("#recommendations").append(html);
    });
    }

    //DeepL APIを使用してテキストを英語に翻訳する関数
    function translateText(text,callback){
        const deeplApiKey = '*********';
        const url = 'https://api-free.deepl.com/v2/translate';
        let translatedText = "";
        
        // APIリクエストのデータを設定
        const data = {
            auth_key: deeplApiKey,
            text: text,
            target_lang: 'EN' // 翻訳先の言語を英語に指定
        };

        // AJAXリクエストを送信
        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            success: function(response) {
                translatedText = response.translations[0].text; // 翻訳結果を取得
                console.log(translatedText);
                callback(translatedText);
            },
            error: function(err) {
                console.error('エラー:', err);
                console.log("エラーが発生しました: " + err.responseText); // エラーメッセージを表示
                callback(null); 
            }
        });
    }

    //感情分析ボタンを押したとき
    $('#analyzeButton').on('click', function() {
        const text = $('#text').val();
        let entext = "";
        const apiKey = '*********';
        const url = 'https://api.au-syd.natural-language-understanding.watson.cloud.ibm.com/instances/c3626c21-ae12-4407-b96e-1851ca13cb33/v1/analyze?version=2024-05-10';
        
        //textを英語に翻訳し、コールバック関数内で感情分析
        translateText(text, function(result) {
            if (result) {
                console.log("翻訳結果:", result);
                entext = result;

                //感情分析
                const data = {
                  "text": entext,
                  "features": {
                    "emotion": {
                      "document": true
                    }
                  }
                };
          
                $.ajax({
                  url: url,
                  type: 'POST',
                  data: JSON.stringify(data),
                  contentType: 'application/json',
                  headers: {
                    'Authorization': 'Basic ' + btoa('apikey:' + apiKey)
                  },
                  success: function(response) {
                    const emotions = response.emotion.document.emotion;

                    // 0〜100の範囲にスケーリング
                    const joyScore = (emotions.joy * 100).toFixed(0);
                    const sadnessScore = (emotions.sadness * 100).toFixed(0);
                    const angerScore = (emotions.anger * 100).toFixed(0);
                    const fearScore = (emotions.fear * 100).toFixed(0);
                    const disgustScore = (emotions.disgust * 100).toFixed(0);

                    // 日本語で結果を整形
                    const resultText = `
                        <p class="joy">喜び<br><span>🤗</span><br> ${joyScore}点</p>
                        <p class="sad">悲しみ<br><span>🥲</span><br> ${sadnessScore}点</p>
                        <p class="anger">怒り<br><span>😡</span><br> ${angerScore}点</p>
                        <p class="fear">恐れ<br><span>😨</span><br> ${fearScore}点</p>
                        <p class="disgust">嫌悪<br><span>😵</span><br> ${disgustScore}点</p>
                    `;

                    // 画面に表示
                    $('#output').html(resultText);

                    var scores = {
                        'joy': parseFloat(joyScore),
                        'sad': parseFloat(sadnessScore),
                        'anger': parseFloat(angerScore),
                        'fear': parseFloat(fearScore),
                        'disgust': parseFloat(disgustScore)
                    };
            
                    // 一番点数が高い感情を見つける
                    let mood = '';
                    let maxScore = -1; // 最小値で初期化
            
                    // 感情をループして一番高いスコアを見つける
                    for (let emotion in scores) {
                        if (scores[emotion] > maxScore) {
                            maxScore = scores[emotion];
                            mood = emotion; // 最も高い感情を代入
                        }
                    }

                    $("."+mood).css("border","solid #b60000 3px");

                    displayRecommendations(mood);
                  },
                  error: function(err) {
                    console.error('Error:', err);
                    $('#output').text("すみません、気持ちを読み取れませんでした😭もう少し詳しく教えてください！");
                  }
                });
            } else {
                console.log("翻訳に失敗しました。");
            }
        });
      });
