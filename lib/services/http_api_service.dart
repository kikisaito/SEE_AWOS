import 'base_api_service.dart';
import '../models/user.dart';
import '../models/emotion.dart';
import '../models/victory_type.dart';
import '../models/evaluation.dart';
import '../models/capsule.dart';
import '../models/dashboard_data.dart';
import '../models/crisis.dart';
import '../models/victory.dart';

class HttpApiService implements BaseApiService {
  final String baseUrl;
  // TODO: Uncomment when implementing HTTP service
  // String? _token;

  HttpApiService({required this.baseUrl});

  @override
  Future<User> login(String email, String password) async {
    throw UnimplementedError('HTTP implementation pending');
  }

  @override
  Future<User> register(
    String email,
    String password,
    String nombrePreferido,
  ) async {
    throw UnimplementedError('HTTP implementation pending');
  }

  @override
  Future<Map<String, dynamic>> getCatalogs() async {
    throw UnimplementedError('HTTP implementation pending');
  }

  @override
  Future<DashboardData> getDashboard() async {
    throw UnimplementedError('HTTP implementation pending');
  }

  @override
  Future<List<Emotion>> getEmotions() async {
    throw UnimplementedError('HTTP implementation pending');
  }

  @override
  Future<List<VictoryType>> getVictoryTypes() async {
    throw UnimplementedError('HTTP implementation pending');
  }

  @override
  Future<List<Evaluation>> getEvaluations() async {
    throw UnimplementedError('HTTP implementation pending');
  }

  @override
  Future<List<Capsule>> getCapsules({int? emotionId}) async {
    throw UnimplementedError('HTTP implementation pending');
  }

  @override
  Future<Capsule> getCapsuleById(String id) async {
    throw UnimplementedError('HTTP implementation pending');
  }

  @override
  Future<Map<String, dynamic>> createCrisis(String emotion) async {
    throw UnimplementedError('HTTP implementation pending');
  }

  @override
  Future<Crisis> updateCrisis(
    String id, {
    String? evaluation,
    bool? breathingCompleted,
  }) async {
    throw UnimplementedError('HTTP implementation pending');
  }

  @override
  Future<List<Crisis>> getMyCrises() async {
    throw UnimplementedError('HTTP implementation pending');
  }

  @override
  Future<Victory> createVictory(String name, DateTime occurredAt) async {
    throw UnimplementedError('HTTP implementation pending');
  }

  @override
  Future<List<Victory>> getMyVictories() async {
    throw UnimplementedError('HTTP implementation pending');
  }

  @override
  Future<Capsule> createCapsule({
    required String title,
    required String content,
    required int emotionId,
  }) async {
    throw UnimplementedError('HTTP implementation pending');
  }
}
