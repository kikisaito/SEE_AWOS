class Crisis {
  final String id;
  final DateTime startedAt;
  final String emotion;
  final String evaluation;
  final bool breathingCompleted;

  Crisis({
    required this.id,
    required this.startedAt,
    required this.emotion,
    required this.evaluation,
    required this.breathingCompleted,
  });

  factory Crisis.fromJson(Map<String, dynamic> json) {
    return Crisis(
      id: json['id'] as String,
      startedAt: DateTime.parse(json['started_at'] as String),
      emotion: json['emotion'] as String,
      evaluation: json['evaluation'] as String,
      breathingCompleted: json['breathing_completed'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'started_at': startedAt.toIso8601String(),
      'emotion': emotion,
      'evaluation': evaluation,
      'breathing_completed': breathingCompleted,
    };
  }

  Crisis copyWith({
    String? id,
    DateTime? startedAt,
    String? emotion,
    String? evaluation,
    bool? breathingCompleted,
  }) {
    return Crisis(
      id: id ?? this.id,
      startedAt: startedAt ?? this.startedAt,
      emotion: emotion ?? this.emotion,
      evaluation: evaluation ?? this.evaluation,
      breathingCompleted: breathingCompleted ?? this.breathingCompleted,
    );
  }
}
