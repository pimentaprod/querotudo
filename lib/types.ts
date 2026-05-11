export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagens: string[]; // URLs Cloudinary permanentes
  estoque: number;
  ativo: boolean;
  destaque: boolean;
  promocao: boolean;
  peso: number;       // kg
  altura: number;     // cm
  largura: number;    // cm
  comprimento: number; // cm
}

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

export interface DadosCheckout {
  nome: string;
  telefone: string;
  endereco: string;
  cep: string;
  pagamento: string;
  observacoes: string;
}
