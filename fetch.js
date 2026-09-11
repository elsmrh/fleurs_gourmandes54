fetch('https://www.picuki.com/profile/fleurs_gourmandes54').then(r=>r.text()).then(t => { 
  const matches = [...t.matchAll(/<img[^>]+src=["']([^"']+\.jpg)["']/gi)]; 
  console.log(matches.map(m => m[1]).slice(0, 10)); 
}).catch(console.error);
