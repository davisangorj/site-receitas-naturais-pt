// Netlify Edge Function (Carla): quem está na zona do euro vê o preço em euro, o mesmo valor fixo do checkout
// do Stripe (R$ 27,90 / 9,90 €). O resto do mundo segue em reais (o Stripe converte para outras moedas).
const EUR = { price: "9,90 €", old: "34,90 €", unit200: "5 cêntimos", unit50: "20 cêntimos" };
const LOCAL = {};
for (const cc of ["PT", "ES", "FR", "DE", "IT", "NL", "BE", "AT", "IE", "FI", "GR", "LU", "SK", "SI", "EE", "LV", "LT", "MT", "CY", "HR"]) LOCAL[cc] = EUR;

export function localize(html, p) {
  return html
    .replaceAll("R$ 27,90", p.price)
    .replaceAll("R$ 99,90", p.old)
    .replace(/([Mm])enos de 15 centavos/g, `$1enos de ${p.unit200}`)
    .replace(/([Mm])enos de 60 centavos/g, `$1enos de ${p.unit50}`);
}

export default async (req, context) => {
  const res = await context.next();
  const p = LOCAL[context.geo?.country?.code || ""];
  if (!p || !(res.headers.get("content-type") || "").includes("text/html")) return res;
  const headers = new Headers(res.headers);
  headers.delete("content-length");
  headers.set("cache-control", "public, max-age=0, must-revalidate");
  return new Response(localize(await res.text(), p), { status: res.status, headers });
};

export const config = { path: ["/", "/livro/", "/livro"] };
