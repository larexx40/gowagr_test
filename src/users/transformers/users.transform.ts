import { User } from '../entities/user.entity';
import { MiniProfile } from '../types/user.type';

export function toMiniProfile(user: User): MiniProfile | null {
  if (!user) return null;
  return {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
  };
}