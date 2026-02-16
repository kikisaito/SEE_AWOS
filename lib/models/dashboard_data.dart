import 'crisis.dart';

class DashboardData {
  final int weeklyVictoriesCount;
  final Crisis? lastCrisis;

  DashboardData({
    required this.weeklyVictoriesCount,
    this.lastCrisis,
  });

  factory DashboardData.fromJson(Map<String, dynamic> json) {
    return DashboardData(
      weeklyVictoriesCount: json['weekly_victories_count'] as int,
      lastCrisis: json['last_crisis'] != null
          ? Crisis.fromJson(json['last_crisis'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'weekly_victories_count': weeklyVictoriesCount,
      'last_crisis': lastCrisis?.toJson(),
    };
  }
}
