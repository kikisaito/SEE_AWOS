import 'base_api_service.dart';
import '../models/user.dart';
import '../models/emotion.dart';
import '../models/victory_type.dart';
import '../models/evaluation.dart';
import '../models/capsule.dart';
import '../models/crisis.dart';
import '../models/victory.dart';

class MockApiService implements BaseApiService {
  @override
  Future<User> login(String email, String password) async {
    await Future.delayed(const Duration(seconds: 1));

    final userJson = {
      "id": "uuid-user-123",
      "email": email,
      "nombrePreferido": "Tony",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token",
    };

    return User.fromJson(userJson);
  }

  @override
  Future<User> register(
    String email,
    String password,
    String nombrePreferido,
  ) async {
    await Future.delayed(const Duration(seconds: 1));

    final userJson = {
      "id": "uuid-user-${DateTime.now().millisecondsSinceEpoch}",
      "email": email,
      "nombrePreferido": nombrePreferido,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token",
    };

    return User.fromJson(userJson);
  }

  @override
  Future<List<Emotion>> getEmotions() async {
    await Future.delayed(const Duration(seconds: 1));

    final emotionsJson = [
      {"id": 1, "name": "Miedo"},
      {"id": 2, "name": "Tristeza"},
      {"id": 3, "name": "Ira"},
      {"id": 4, "name": "Ansiedad"},
      {"id": 5, "name": "Alegría"},
    ];

    return emotionsJson.map((json) => Emotion.fromJson(json)).toList();
  }

  @override
  Future<List<VictoryType>> getVictoryTypes() async {
    await Future.delayed(const Duration(seconds: 1));

    final typesJson = [
      {"id": 1, "name": "Higiene"},
      {"id": 2, "name": "No Consumo"},
      {"id": 3, "name": "Ejercicio"},
      {"id": 4, "name": "Alimentación"},
    ];

    return typesJson.map((json) => VictoryType.fromJson(json)).toList();
  }

  @override
  Future<List<Evaluation>> getEvaluations() async {
    await Future.delayed(const Duration(seconds: 1));

    final evaluationsJson = [
      {"id": 1, "description": "Mejor"},
      {"id": 2, "description": "Igual"},
      {"id": 3, "description": "Peor"},
    ];

    return evaluationsJson.map((json) => Evaluation.fromJson(json)).toList();
  }

  @override
  Future<List<Capsule>> getCapsules({int? emotionId}) async {
    await Future.delayed(const Duration(seconds: 1));

    final capsulesJson = [
      {
        "id": "uuid-capsule-555",
        "title": "Respira conmigo",
        "content": "Inhala en 4, sostén en 7, exhala en 8. Repite este ciclo.",
        "emotion_id": 4,
        "is_active": true,
      },
      {
        "id": "uuid-capsule-556",
        "title": "Momento de calma",
        "content": "Cierra los ojos y encuentra tu centro interior.",
        "emotion_id": 1,
        "is_active": true,
      },
      {
        "id": "uuid-capsule-557",
        "title": "Ejercicio de grounding",
        "content": "Identifica 5 cosas que ves, 4 que tocas, 3 que escuchas...",
        "emotion_id": 4,
        "is_active": true,
      },
    ];

    var capsules = capsulesJson.map((json) => Capsule.fromJson(json)).toList();

    if (emotionId != null) {
      capsules = capsules.where((c) => c.emotionId == emotionId).toList();
    }

    return capsules;
  }

  @override
  Future<Capsule> getCapsuleById(String id) async {
    await Future.delayed(const Duration(seconds: 1));

    final capsuleJson = {
      "id": id,
      "title": "Respira conmigo",
      "content": "Inhala en 4, sostén en 7, exhala en 8. Repite este ciclo.",
      "emotion_id": 4,
      "is_active": true,
    };

    return Capsule.fromJson(capsuleJson);
  }

  @override
  Future<Crisis> createCrisis(String emotion) async {
    await Future.delayed(const Duration(seconds: 1));

    final crisisJson = {
      "id": "uuid-crisis-${DateTime.now().millisecondsSinceEpoch}",
      "started_at": DateTime.now().toIso8601String(),
      "emotion": emotion,
      "evaluation": "",
      "breathing_completed": false,
    };

    return Crisis.fromJson(crisisJson);
  }

  @override
  Future<Crisis> updateCrisis(
    String id, {
    String? evaluation,
    bool? breathingCompleted,
  }) async {
    await Future.delayed(const Duration(seconds: 1));

    final crisisJson = {
      "id": id,
      "started_at": DateTime.now()
          .subtract(const Duration(minutes: 5))
          .toIso8601String(),
      "emotion": "Ansiedad",
      "evaluation": evaluation ?? "Mejor",
      "breathing_completed": breathingCompleted ?? true,
    };

    return Crisis.fromJson(crisisJson);
  }

  @override
  Future<List<Crisis>> getMyCrises() async {
    await Future.delayed(const Duration(seconds: 1));

    final crisesJson = [
      {
        "id": "uuid-crisis-999",
        "started_at": "2026-02-10T14:00:00Z",
        "emotion": "Ansiedad",
        "evaluation": "Mejor",
        "breathing_completed": true,
      },
      {
        "id": "uuid-crisis-998",
        "started_at": "2026-02-08T10:30:00Z",
        "emotion": "Miedo",
        "evaluation": "Igual",
        "breathing_completed": true,
      },
    ];

    return crisesJson.map((json) => Crisis.fromJson(json)).toList();
  }

  @override
  Future<Victory> createVictory(String name, DateTime occurredAt) async {
    await Future.delayed(const Duration(seconds: 1));

    final victoryJson = {
      "id": "uuid-victory-${DateTime.now().millisecondsSinceEpoch}",
      "name": name,
      "occurred_at": occurredAt.toIso8601String(),
    };

    return Victory.fromJson(victoryJson);
  }

  @override
  Future<List<Victory>> getMyVictories() async {
    await Future.delayed(const Duration(seconds: 1));

    final victoriesJson = [
      {
        "id": "uuid-victory-111",
        "name": "No Consumo",
        "occurred_at": "2026-02-10T15:30:00Z",
      },
      {
        "id": "uuid-victory-112",
        "name": "Ejercicio",
        "occurred_at": "2026-02-11T08:00:00Z",
      },
      {
        "id": "uuid-victory-113",
        "name": "Higiene",
        "occurred_at": "2026-02-12T07:30:00Z",
      },
    ];

    return victoriesJson.map((json) => Victory.fromJson(json)).toList();
  }
}
