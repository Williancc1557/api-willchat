import { DbSaveMessage } from "../../../data/usecase/save-message/save-message";
import { SaveMessagePostgreRepository } from "../../../infra/db/postgreSQL/repositories/save-message-repository";
import { SaveMessageController } from "../../../presentation/controller/save-message/save-message";
import { makeSaveMessageValidation } from "./save-message-validations";

export const makeSaveMessage = () => {
  const saveMessageRepository = new SaveMessagePostgreRepository();
  const dbSaveMessage = new DbSaveMessage(saveMessageRepository);

  return new SaveMessageController(makeSaveMessageValidation(), dbSaveMessage);
};