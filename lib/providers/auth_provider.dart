import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/base_api_service.dart';

class AuthProvider extends ChangeNotifier {
  final BaseApiService _apiService;
  User? _user;
  bool _isLoading = false;
  String? _errorMessage;

  AuthProvider(this._apiService);

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _user != null;

  Future<void> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _user = await _apiService.login(email, password);
      await _saveToken(_user!.token);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> register(
    String email,
    String password,
    String nombrePreferido,
  ) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _user = await _apiService.register(email, password, nombrePreferido);
      await _saveToken(_user!.token);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _user = null;
    await _clearToken();
    notifyListeners();
  }

  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  Future<void> _clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  Future<void> loadSavedUser() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');

    if (token != null) {}
  }
}
