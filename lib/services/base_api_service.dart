import '../models/user.dart';
import '../models/emotion.dart';
import '../models/victory_type.dart';
import '../models/evaluation.dart';
import '../models/capsule.dart';
import '../models/crisis.dart';
import '../models/victory.dart';

abstract class BaseApiService {
  Future<User> login(String email, String password);
  Future<User> register(String email, String password, String nombrePreferido);

  Future<List<Emotion>> getEmotions();
  Future<List<VictoryType>> getVictoryTypes();
  Future<List<Evaluation>> getEvaluations();

  Future<List<Capsule>> getCapsules({int? emotionId});
  Future<Capsule> getCapsuleById(String id);

  Future<Crisis> createCrisis(String emotion);
  Future<Crisis> updateCrisis(
    String id, {
    String? evaluation,
    bool? breathingCompleted,
  });
  Future<List<Crisis>> getMyCrises();

  Future<Victory> createVictory(String name, DateTime occurredAt);
  Future<List<Victory>> getMyVictories();
}
