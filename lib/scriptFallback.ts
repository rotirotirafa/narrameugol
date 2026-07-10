import type { NarrationStyle } from "@/lib/types";

/**
 * Roteiro de narração genérico usado quando o Gemini está indisponível.
 *
 * É uma função PURA: sem rede, sem async, sem aleatoriedade — para cada estilo
 * retorna sempre exatamente a mesma string. Não inventa nomes de jogadores nem
 * minutos específicos: fica no genérico ("o camisa 10", "a galera da várzea",
 * "a bola") para nunca contradizer o vídeo de fato.
 */
export function fallbackScript(style: NarrationStyle): string {
  if (style === "hype") {
    return (
      "OLHA O QUE É ISSOOO, minha gente!!! A bola rola no gramado e o coração já dispara... " +
      "É o camisa 10 que pega essa redonda, sente o cheiro do gol e a galera da várzea vem junto, EM PESO! " +
      "Ele arranca, tira um, tira dois, deixa TODO MUNDO no chão... a defesa se enrola, se atrapalha, se perde no meio do caminho! " +
      "E agora, senhoras e senhores, prepara o coração porque vem aí... " +
      "GOOOOOOL! GOOOOOL DE PLACA, meu amigo!!! É a bola no fundo do barbante, é a arquibancada que vem ABAIXO! " +
      "Guarda essa, guarda essa pra contar pros netos, porque futebol é isso: é magia, é raça, é PAIXÃO na veia! " +
      "Tá gravado, tá eternizado, é GOL DE OUTRO MUNDO!!!"
    );
  }

  // classic — locutor clássico e comedido
  return (
    "Senhoras e senhores, boa tarde. A bola volta a rolar no gramado com toda a naturalidade de quem conhece o ofício. " +
    "O camisa 10 recebe com categoria, ergue a cabeça e domina o tempo da jogada com serenidade. " +
    "A galera da várzea acompanha atenta, no aguardo do lance decisivo. " +
    "Ele avança pelo meio, encara a marcação, ajeita o corpo e prepara a finalização com capricho... " +
    "E é gol. Gol trabalhado, gol de quem soube esperar o momento certo. " +
    "Um lance bem construído, sem pressa, do início ao fim. " +
    "O futebol, meus amigos, recompensa quem joga com inteligência. Seguimos juntos, com a bola no centro do gramado."
  );
}
