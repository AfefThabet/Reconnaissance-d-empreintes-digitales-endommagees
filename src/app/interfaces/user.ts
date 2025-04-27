import { UserAuth } from "./user-auth"
import { expertinfo } from "./expert-info"

export interface User {
    user_auth: UserAuth,
    user_info: expertinfo
}
