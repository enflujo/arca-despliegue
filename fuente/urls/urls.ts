export const urls = {
  estaticas: [
    ['artecolonialamericano.az.uniandes.edu.co:8080', 'arca.uniandes.edu.co'],
    ['/artworks', '/archivo/obras'],
    ['/artworks?topic=true', '/archivo/categorias'],
  ],
  dinamicas: [
    ['/artworks?topic=$variable', '/archivo/categoria/$variable'],
    ['/artworks/$variable', '/archivo/obras/$variable'],
  ],
};
