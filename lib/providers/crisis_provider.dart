import 'package:flutter/foundation.dart';
import '../models/crisis.dart';
import '../models/capsule.dart';
import '../services/base_api_service.dart';

class CrisisProvider extends ChangeNotifier {
  final BaseApiService _apiService;

  Crisis? _currentCrisis;
  Capsule? _recommendedCapsule;
  bool _isLoading = false;
  String? _errorMessage;

  CrisisProvider(this._apiService);

  Crisis? get currentCrisis => _currentCrisis;
  Capsule? get recommendedCapsule => _recommendedCapsule;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> startCrisis(String emotionName) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _apiService.createCrisis(emotionName);
      _currentCrisis = result['crisis'] as Crisis;
      _recommendedCapsule = result['capsule'] as Capsule?;

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> endCrisis(String evaluation, bool breathingCompleted) async {
    if (_currentCrisis == null) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _apiService.updateCrisis(
        _currentCrisis!.id,
        evaluation: evaluation,
        breathingCompleted: breathingCompleted,
      );

      _currentCrisis = null;
      _recommendedCapsule = null;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearCrisis() {
    _currentCrisis = null;
    _recommendedCapsule = null;
    _errorMessage = null;
    notifyListeners();
  }
}
