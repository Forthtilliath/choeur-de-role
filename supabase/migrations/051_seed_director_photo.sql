-- Photo de la directrice artistique (Camille Vidal) sur le bloc "Direction artistique"
update home_blocks
set image_url = '/images/director-camille.webp',
    image_ratio = '3/4'
where content like '%Direction artistique%';
