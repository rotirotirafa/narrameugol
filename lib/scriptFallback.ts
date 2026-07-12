import type { NarrationStyle } from "@/lib/types";
import type { Lang } from "@/lib/i18n";

/**
 * Roteiro de narração genérico usado quando o Gemini está indisponível.
 *
 * Função PURA: sem rede, sem async, sem aleatoriedade — para cada (idioma,
 * estilo) retorna sempre a mesma string. Não inventa nomes de jogadores nem
 * minutos: fica no genérico ("o camisa 10" / "number 10") para nunca
 * contradizer o vídeo de fato.
 */
const SCRIPTS: Record<Lang, Record<NarrationStyle, string>> = {
  "pt-BR": {
    hype:
      "OLHA O QUE É ISSOOO, minha gente!!! A bola rola no gramado e o coração já dispara... " +
      "É o camisa 10 que pega essa redonda, sente o cheiro do gol e a galera da várzea vem junto, EM PESO! " +
      "Ele arranca, tira um, tira dois, deixa TODO MUNDO no chão... a defesa se enrola, se atrapalha, se perde no meio do caminho! " +
      "E agora, senhoras e senhores, prepara o coração porque vem aí... " +
      "GOOOOOOL! GOOOOOL DE PLACA, meu amigo!!! É a bola no fundo do barbante, é a arquibancada que vem ABAIXO! " +
      "Guarda essa, guarda essa pra contar pros netos, porque futebol é isso: é magia, é raça, é PAIXÃO na veia! " +
      "Tá gravado, tá eternizado, é GOL DE OUTRO MUNDO!!!",
    classic:
      "Senhoras e senhores, boa tarde. A bola volta a rolar no gramado com toda a naturalidade de quem conhece o ofício. " +
      "O camisa 10 recebe com categoria, ergue a cabeça e domina o tempo da jogada com serenidade. " +
      "A galera da várzea acompanha atenta, no aguardo do lance decisivo. " +
      "Ele avança pelo meio, encara a marcação, ajeita o corpo e prepara a finalização com capricho... " +
      "E é gol. Gol trabalhado, gol de quem soube esperar o momento certo. " +
      "Um lance bem construído, sem pressa, do início ao fim. " +
      "O futebol, meus amigos, recompensa quem joga com inteligência. Seguimos juntos, com a bola no centro do gramado.",
  },
  en: {
    hype:
      "OH, WHAT A MOMENT, ladies and gentlemen!!! The ball rolls onto the pitch and hearts are already pounding... " +
      "It's number 10 who picks it up, smells the goal, and the whole street-football crowd comes ALONG, in FULL FORCE! " +
      "He drives forward, beats one, beats two, leaves EVERYONE on the floor... the defense tangles up, stumbles, gets lost in the middle of it all! " +
      "And now, ladies and gentlemen, hold your heart because here it comes... " +
      "GOOOOOAL! WHAT A GOAL, my friend!!! It's the ball in the back of the net, it's the crowd coming DOWN! " +
      "Save this one, save it to tell your grandkids, because football is this: it's magic, it's grit, it's PASSION in the veins! " +
      "It's recorded, it's eternal — it's a goal from another world!!!",
    classic:
      "Ladies and gentlemen, good afternoon. The ball rolls again across the pitch with all the ease of someone who knows the craft. " +
      "Number 10 receives it with class, lifts his head, and controls the tempo of the play with composure. " +
      "The street-football crowd watches closely, waiting for the decisive moment. " +
      "He advances through the middle, faces the marking, sets his body, and prepares the finish with care... " +
      "And it's a goal. A well-worked goal, a goal from someone who knew how to wait for the right moment. " +
      "A nicely built play, unhurried, from start to finish. " +
      "Football, my friends, rewards those who play with intelligence. We carry on, ball back at the center circle.",
  },
};

export function fallbackScript(style: NarrationStyle, lang: Lang): string {
  return SCRIPTS[lang][style];
}
