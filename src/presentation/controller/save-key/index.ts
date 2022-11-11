import { badRequest, ok, serverError } from "../../helpers/http-helper";
import type { Validation } from "../../protocols/validation";
import type { HttpRequest, HttpResponse } from "../../protocols/http";
import type { Controller } from "../../protocols/controller";
import type { DecodeJwt } from "../../protocols/decode-jwt";
import { InvalidParamError } from "../../errors/invalid-param-error";
import type { SaveKey } from "../../../domain/usecase/save-key";

export class SaveKeyController implements Controller {
  public constructor(
    private readonly validator: Validation,
    private readonly decodeJwt: DecodeJwt,
    private readonly saveKey: SaveKey
  ) {}

  public async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validator.validate(httpRequest.body);
      if (error) return badRequest(error);

      const account = this.decodeJwt.decode(httpRequest.body.accessToken);

      if (!account.accountId)
        return badRequest(new InvalidParamError("accessToken"));

      await this.saveKey.save({
        userId: account.accountId,
      });

      return ok();
    } catch (err) {
      return serverError();
    }
  }
}
