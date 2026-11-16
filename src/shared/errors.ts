// Erros conhecidos levam uma mensagem e um código HTTP até a tela.
export class ApplicationError extends Error {
  public readonly status: number;

  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.status = status;
  }
}

export class ValidationError extends ApplicationError {
  public readonly campos: Record<string, string>;

  constructor(campos: Record<string, string>) {
    super('Confira os campos indicados abaixo.', 422);
    this.campos = campos;
  }
}
