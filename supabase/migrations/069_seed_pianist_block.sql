-- Présentation publique du pianiste (Julien Leroux) sur la page d'accueil,
-- juste après le bloc "Direction artistique". On décale les blocs suivants.
update home_blocks set order_index = 3 where order_index = 2;
update home_blocks set order_index = 2 where order_index = 1;

insert into home_blocks (content, image_url, image_ratio, order_index, active)
values (
  '<h2>Notre pianiste</h2><h3>Julien Leroux</h3><p>Julien a appris le piano avant de savoir lire, et les règles du jeu d''échecs bien après — mais c''est aux jeux de plateau coopératifs qu''il a pris goût le plus tard, un peu par contamination en rejoignant le chœur.</p><p>Formé au conservatoire d''Angers, il accompagne <strong>Le Chœur de Rôle depuis sa création</strong>, capable de déchiffrer une partition inconnue en répétition comme de retomber sur ses pieds quand la chef de chœur change tout au dernier moment.</p><p>Le reste du temps, on le retrouve plutôt du côté du <strong>Ludi''Café</strong>, une partie de jeu de plateau en tête, toujours partant pour transformer une soirée entre choristes en tournoi improvisé.</p><p><em>« Un bon accompagnement, c''est un peu comme une bonne partie : on ne doit jamais sentir qui mène. »</em></p>',
  'https://randomuser.me/api/portraits/men/48.jpg',
  '3/4',
  1,
  true
);
