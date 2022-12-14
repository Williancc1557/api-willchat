import type { GetKey, GetKeyInput } from "../../../src/domain/usecase/get-key";
import { ChatEntity } from "../../../src/infra/db/postgreSQL/entities/chat-postgresql-entity";
import type { KeyEntity } from "../../../src/infra/db/postgreSQL/entities/key-postgresql-entity";
import { GetKeyController } from "../../../src/presentation/controller/get-key";
import { UserNotExistsError } from "../../../src/presentation/errors/user-not-exists-error";
import {
  badRequest,
  ok,
  serverError,
} from "../../../src/presentation/helpers/http-helper";
import type { HttpRequest } from "../../../src/presentation/protocols/http";
import type { Validation } from "../../../src/presentation/protocols/validation";

const makeValidatorStub = (): Validation => {
  class ValidatorStub implements Validation {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public validate(input: any): Error {
      return;
    }
  }

  return new ValidatorStub();
};

const makeGetKeyStub = () => {
  class GetKeyStub implements GetKey {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async get(data: GetKeyInput): Promise<Array<KeyEntity>> {
      return [
        {
          id: "fake-key",
          key: "123",
          userId: "fake-user-id",
          chat: new ChatEntity(),
        },
      ];
    }
  }

  return new GetKeyStub();
};

const makeSut = () => {
  const validator = makeValidatorStub();
  const getKey = makeGetKeyStub();
  const sut = new GetKeyController(validator, getKey);

  return {
    sut,
    validator,
    getKey,
  };
};

const fakeHttpRequest: HttpRequest = {
  header: {
    accesstoken: "fake-accesstoken",
  },
  body: {
    accountId: "fake-account-id",
  },
};

describe("GetKey Controller", () => {
  test("should return an Error if validator returns an Error", async () => {
    const { sut, validator } = makeSut();
    jest.spyOn(validator, "validate").mockReturnValue(new Error());
    const request = await sut.handle(fakeHttpRequest);

    expect(request).toStrictEqual(badRequest(new Error()));
  });

  test("should call validator with correct values", async () => {
    const { sut, validator } = makeSut();
    const validateSpy = jest.spyOn(validator, "validate");
    await sut.handle(fakeHttpRequest);

    expect(validateSpy).toBeCalledWith(fakeHttpRequest.header);
  });

  test("should return serverError if validator throws", async () => {
    const { sut, validator } = makeSut();
    jest.spyOn(validator, "validate").mockImplementationOnce(() => {
      throw new Error();
    });

    const res = await sut.handle(fakeHttpRequest);

    expect(res).toStrictEqual(serverError());
  });

  test("should call getKey with correctly value", async () => {
    const { sut, getKey } = makeSut();
    const getSpy = jest.spyOn(getKey, "get");

    await sut.handle(fakeHttpRequest);

    expect(getSpy).toBeCalledWith({
      userId: "fake-account-id",
    });
  });

  test("should return serverError if getKey throws", async () => {
    const { sut, getKey } = makeSut();
    jest.spyOn(getKey, "get").mockRejectedValueOnce(new Error());

    const promise = await sut.handle(fakeHttpRequest);

    expect(promise).toStrictEqual(serverError());
  });

  test("should return badRequest if getKey return a void array", async () => {
    const { sut, getKey } = makeSut();
    jest.spyOn(getKey, "get").mockResolvedValueOnce([]);

    const res = await sut.handle(fakeHttpRequest);

    expect(res).toStrictEqual(badRequest(new UserNotExistsError()));
  });

  test("should return key if success", async () => {
    const { sut } = makeSut();
    const res = await sut.handle(fakeHttpRequest);

    expect(res).toStrictEqual(
      ok([
        {
          id: "fake-key",
          key: "123",
          userId: "fake-user-id",
          chat: new ChatEntity(),
        },
      ])
    );
  });
});
